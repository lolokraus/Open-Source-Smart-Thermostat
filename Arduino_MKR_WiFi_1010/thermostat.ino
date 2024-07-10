#include <SPI.h>
#include <WiFiNINA.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <RTClib.h>
#include <MHZ19.h>
#include "LinkedList.h"
#include "Adafruit_SHT31.h"

const char *ssid = "WIFI_SSID";
const char *password = "WIFI_PASSWORD";
const char *server = "SERVER_API";
const String username = "SERVER_USERNAME";
const String userPassword = "SERVER_PASSWORD";
const int port = 443;

const String authenticateURL = "/api/authenticate";
const String temperatureURL = "/api/sensor/temperature";
const String humidityURL = "/api/sensor/humidity";
const String co2URL = "/api/sensor/co2";
const String heartbeatURL = "/api/heartbeat";
const String heatingStatusURL = "/api/heating/status";

WiFiSSLClient client;

#define SCREEN_WIDTH 128 
#define SCREEN_HEIGHT 64 
#define OLED_RESET     -1 
#define SCREEN_ADDRESS 0x3C 
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

Adafruit_SHT31 sht31 = Adafruit_SHT31();

MHZ19 mhz19;

RTC_DS3231 rtc;

const int RELAY_PIN = 3;

String token;

#define FALLBACK_TEMPERATURE 15.0
bool isHeatingOn = false;

bool fallbackMode = false;
bool heartbeatSuccess = true;

unsigned long lastHeartbeatMillis = 0;
unsigned long lastReconnectMillis = 0;
unsigned long lastDisplayMillis = 0;

const unsigned long WIFI_TIMEOUT = 30000;        // 30 seconds
const unsigned long HEARTBEAT_INTERVAL = 180000; // 3 minutes
const unsigned long DISPLAY_INTERVAL = 5000;     // 5 seconds
const unsigned long RECONNECT_INTERVAL = 300000; // 5 minutes

struct Request
{
  String url;
  String postData;
  bool isHeartbeat;
};

LinkedList<Request *> requestList = LinkedList<Request *>();

void setup()
{
  Serial1.begin(9600);
  Serial.begin(9600);

  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 allocation failed"));
    for(;;);
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  if(!sht31.begin(0x44)) {
    Serial.println(F("SHT31 allocation failed"));
    for(;;);
  }

  if(!rtc.begin()) {
    Serial.println(F("RTC allocation failed"));
    for(;;);
  }

  mhz19.begin(Serial1);
  mhz19.autoCalibration();

  pinMode(RELAY_PIN, OUTPUT);

  connectToWiFi();
  authenticate();
}

void loop()
{
  unsigned long currentMillis = millis();

  if (!fallbackMode && (currentMillis - lastHeartbeatMillis >= HEARTBEAT_INTERVAL))
  {
    enqueueRequest(heartbeatURL, "", true);

    if (heartbeatSuccess)
    {
      float temperature = sht31.readTemperature();
      float humidity = sht31.readHumidity();
      int co2 = mhz19.getCO2();
      String formattedDateTime = getFormattedDateTime();
      enqueueRequest(temperatureURL, "{\"value\":" + String(temperature, 2) + ", \"heatingOn\":" + (isHeatingOn ? "1" : "0") + ", \"deviceTimestamp\":\"" + formattedDateTime + "\"}", false);
      enqueueRequest(humidityURL, "{\"value\":" + String(humidity, 2) + ", \"heatingOn\":" + (isHeatingOn ? "1" : "0") + ", \"deviceTimestamp\":\"" + formattedDateTime + "\"}", false);
      enqueueRequest(co2URL, "{\"value\":" + String(co2) + ", \"heatingOn\":" + (isHeatingOn ? "1" : "0") + ", \"deviceTimestamp\":\"" + formattedDateTime + "\"}", false);
      enqueueRequest(heatingStatusURL, "", false);
    }

    lastHeartbeatMillis = currentMillis;
  }

  if (!fallbackMode && requestList.size() != 0)
  {
    processRequests();
  }

  if (fallbackMode && (currentMillis - lastReconnectMillis >= RECONNECT_INTERVAL))
  {
    attemptReconnect();
    lastReconnectMillis = currentMillis;
  }

  if (fallbackMode)
  {
    float currentTemperature = sht31.readTemperature();

    if (currentTemperature <= (FALLBACK_TEMPERATURE - 0.5) && !isHeatingOn)
    {
      digitalWrite(RELAY_PIN, HIGH);
      isHeatingOn = true;
    }
    else if (currentTemperature >= (FALLBACK_TEMPERATURE + 0.3) && isHeatingOn)
    {
      digitalWrite(RELAY_PIN, LOW);
      isHeatingOn = false;
    }
  }

  if (currentMillis - lastDisplayMillis >= DISPLAY_INTERVAL)
  {
    displaySensorData();
    lastDisplayMillis = currentMillis;
  }
}

void enqueueRequest(const String &url, const String &postData, bool isHeartbeat)
{
  Request *newRequest = new Request();
  newRequest->url = url;
  newRequest->postData = postData;
  newRequest->isHeartbeat = isHeartbeat;
  requestList.add(newRequest);
}

void processRequests()
{
  if (!client.connected())
  {
    if (!client.connect(server, port))
    {
      fallbackMode = true;
      return;
    }
  }

  while (requestList.size() > 0)
  {
    Request *currentRequest = requestList.shift();

    if (currentRequest->isHeartbeat)
    {
      if (sendHeartbeatRequest(currentRequest->url, currentRequest->postData))
      {
        heartbeatSuccess = true;
      }
      else
      {
        heartbeatSuccess = false;
        fallbackMode = true;
      }
    }
    else if (heartbeatSuccess && currentRequest->url == heatingStatusURL)
    {
      int shouldHeat = requestHeatingStatusFromServer(currentRequest->url);
      if (shouldHeat == -1)
      {
        fallbackMode = true;
      }
      else if (shouldHeat == 1 && !isHeatingOn)
      {
        digitalWrite(RELAY_PIN, HIGH);
        isHeatingOn = true;
      }
      else if (shouldHeat == 0 && isHeatingOn)
      {
        digitalWrite(RELAY_PIN, LOW);
        isHeatingOn = false;
      }
    }
    else if (heartbeatSuccess)
    {
      sendSensorDataRequest(currentRequest->url, currentRequest->postData);
    }
    delete currentRequest;
  }
  client.stop();
}

bool sendAuthenticationRequest(String path, String postData)
{
  client.println("POST " + path + " HTTP/1.1");
  client.println("Host: " + String(server));
  client.println("Content-Type: application/json");
  client.print("Content-Length: ");
  client.println(postData.length());
  client.println();
  client.print(postData);

  long startTime = millis();
  while (client.connected() && millis() - startTime < 5000)
  {
    if (client.available())
    {
      String line = client.readStringUntil('\n');
      if (line.indexOf("{\"token\":\"") >= 0)
      {
        int tokenStart = line.indexOf(":\"") + 2;
        int tokenEnd = line.indexOf("\"}", tokenStart);
        token = line.substring(tokenStart, tokenEnd);
        return true;
      }
    }
  }
  return false;
}

bool sendHeartbeatRequest(String path, String postData)
{
  client.println("POST " + path + " HTTP/1.1");
  client.println("Host: " + String(server));
  client.println("Authorization: Bearer " + token);
  client.println("Content-Type: application/json");
  client.print("Content-Length: ");
  client.println(postData.length());
  client.println();

  long startTime = millis();
  while (client.connected() && millis() - startTime < 5000)
  {
    if (client.available())
    {
      String line = client.readStringUntil('\n');
      if (line.indexOf("\"token\":\"") >= 0)
      {
        int tokenStart = line.indexOf("token\":\"") + 8;
        int tokenEnd = line.indexOf("\"}", tokenStart);
        token = line.substring(tokenStart, tokenEnd);
        return true;
      }

      if (line.indexOf("\"message\":\"Heartbeat received. Token still valid.") != -1)
      {
        return true;
      }
    }
  }
  return false;
}

int requestHeatingStatusFromServer(String path)
{
  client.println("GET " + path + " HTTP/1.1");
  client.println("Host: " + String(server));
  client.println("Authorization: Bearer " + token);
  client.println("Content-Type: application/json");
  client.println();

  long startTime = millis();
  while (client.connected() && millis() - startTime < 5000)
  {
    if (client.available())
    {
      String line = client.readStringUntil('\n');
      if (line.startsWith("{\"heatingOn\":true"))
      {
        return 1;
      }
      else if (line.startsWith("{\"heatingOn\":false"))
      {
        return 0;
      }
    }
  }
  return -1;
}

bool sendSensorDataRequest(String path, String postData)
{
  client.println("POST " + path + " HTTP/1.1");
  client.println("Host: " + String(server));
  client.println("Authorization: Bearer " + token);
  client.println("Content-Type: application/json");
  client.print("Content-Length: ");
  client.println(postData.length());
  client.println();
  client.print(postData);

  long startTime = millis();
  while (client.connected() && millis() - startTime < 5000)
  {
    if (client.available())
    {
      String line = client.readStringUntil('\n');
      if (line.startsWith("HTTP/1.1 201 Created"))
      {
        return true;
      }
    }
  }
  return false;
}

void connectToWiFi()
{
  client.stop();
  WiFi.disconnect();
  WiFi.end();
  delay(2000);

  unsigned long lastWifiAttemptMillis = millis();
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED && (millis() - lastWifiAttemptMillis < WIFI_TIMEOUT))
  {
    delay(1000);
  }

  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println("Failed to connect to WiFi, entering fallback mode.");
    fallbackMode = true;
  }
  else
  {
    Serial.println("Connected to WiFi");
    fallbackMode = false;
  }
}

void authenticate()
{
  if (fallbackMode || !client.connect(server, port))
  {
    fallbackMode = true;
    client.stop();
    return;
  }

  String postData = "{\"username\":\"" + username + "\",\"password\":\"" + userPassword + "\"}";
  if (sendAuthenticationRequest(authenticateURL, postData))
  {
    fallbackMode = false;
  }
  else
  {
    fallbackMode = true;
  }
  client.stop();
}

void attemptReconnect()
{
  Serial.println("Connection lost. Attempting to reconnect...");
  connectToWiFi();
  authenticate();
}

String getFormattedDateTime()
{
  DateTime now = rtc.now();
  char buffer[] = "YYYY-MM-DD hh:mm:ss";
  now.toString(buffer);
  return String(buffer);
}

/*bool DST() {
  byte yy = year.now() % 100;
  byte mm = month.now();
  byte dd = day.now();
  byte x1 = 31 - (yy + yy / 4 - 2) % 7;
  byte x2 = 31 - (yy + yy / 4 + 2) % 7;

  return (mm > 3 && mm < 10) || (mm == 3 && dd >= x1) || (mm == 10 && dd < x2);
}*/

void displaySensorData()
{
  DateTime now = rtc.now();
  float temperature = sht31.readTemperature();
  float humidity = sht31.readHumidity();
  int co2 = mhz19.getCO2();

  display.clearDisplay();
  display.setCursor(0, 0);

  if (fallbackMode)
  {
    display.println("Fallback mode");
  }
  else
  {
    display.println("Normal mode");
  }

  display.print("Date: ");
  display.print(now.day());
  display.print("/");
  display.print(now.month());
  display.print("/");
  display.println(now.year());

  display.print("Time: ");
  if (now.hour() < 10)
    display.print("0");
  display.print(now.hour());
  display.print(":");
  if (now.minute() < 10)
    display.print("0");
  display.print(now.minute());

  display.println();
  display.print("Temp: ");
  display.print(temperature);
  display.println(" *C");
  display.print("Humidity: ");
  display.print(humidity);
  display.println("%");
  display.print("CO2: ");
  display.print(co2);
  display.println(" ppm");

  display.display();
}