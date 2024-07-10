# Open-Source Smart Thermostat
This project is part of the study course "Media and Human-Centered Computing" at the Vienna University of Technology. The goal of this project is to create an open-source smart thermostat. For us open-source means accessible because everyone can adapt this groundwork of a working thermostat to their specific needs.

## Is This Usable for Me?
In most heating systems, a thermostat controls the heater by closing (shorting) a contact, which completes an electrical circuit and activates the heating unit. This thermostat works in the same way, using a relay to close the electircal circuit, if your current thermostat operates like this you will be able to use this thermostat too.

Additionally, to utilize all features of the thermostat, such as remote monitoring and control, you will need a server. This server handles communication between you and the thermostat and collects the data. However, if you don't have a server, you can still build a standalone thermostat based on the physical components we used and maybe you can reuse some of our code.

## Sections
1. [Physical Components and Custom PCB Design](#physical-components)
2. [3D Printable Case](#3d-printable-case)
3. [Arduino Code Upload and Overview](#arduino-code-upload-and-overview)
4. [Database](#database)
5. [Server Setup and Code Overview](#server-setup-and-code-overview)

## Physical Components

For the physical thermostat we tried to replicate a normal thermostat with sensors that can be bought online. We then designed a custom PCB for these components and had our PCB manufactured by Eurocircuits to which we soldered the components.

### Sensors

- **Temperature and Humidity Sensor (SHT31-D)**
- **CO2 Sensor (MH-Z19C)** (Optional, we used it to collect additional data)
- **OLED Display (SSD1306)**
- **Real-Time Clock (RTC) Module (DS3231):** For keeping track of the exact time.
- **Relay Module (5V, SRD-05VDC-SL-C):** Controls the heating system by acting as a switch.

### Arduino

- **Arduino MKR WiFi 1010:** The microcontroller that processes sensor data and controls the heating system. It features WiFi and Bluetooth. We only used Wifi for this project.

### PCB Design with KiCad

KiCad is an open-source software suite for electronic design automation that allows you to create schematics, design custom footprints and symbols, and layout PCBs. You can download it here: https://www.kicad.org/download/ and then import our files into KiCad.

The process of creating a custom PCB normally involves:

1. **Schematic Design:** Create a schematic diagram of the circuit, which includes all the components and their connections.
2. **Footprints and Symbols:** Use or create footprints and symbols for each component in the schematic. Footprints are the physical patterns on the PCB, and symbols represent the components in the schematic.
3. **PCB Layout:** Convert the schematic into a PCB layout, positioning the components and routing the electrical connections.

After importing our project you can have a look at our schmatic design, the custom footprints and the PCB and adapt them to your exact needs. 

#### Important Files in the KiCad Repository

- **thermostat.kicad_pcb:** The PCB layout file containing the design of the board.
- **Custom_Footprints.pretty:** Directory containing custom footprints used in the project.
- **Custom_Pinholes.kicad_sym:** Custom symbol file for the pinholes.
- **thermostat.kicad_sch:** The schematic file containing the circuit diagram.

Once the design is complete, you can use services like PCBWay or Eurocircuits to manufacture the PCB.

## 3D Printable Case

We designed a simple case to make the thermostat look more polished and resemble a typical thermostat. You can download our STL file and import it into Tinkercad or any other 3D modeling software. You can adapt it to your liking and then 3D print it. Our design is quite basic and serves as a prototype, so you can improve and customize it as needed.

To fit the PCB exactly in the case you can export the PCB layout from KiCad as a SVG file and import it into your 3D modeling software. This way you can design the case around the PCB and make sure everything fits.

## Arduino Code Upload and Overview

The Arduino serves as the brain of the thermostat, connecting to sensors, controlling heating, and communicating with the server.

### Features Overview

- Connects to WiFi and uploads data to the server.
- Sends heartbeats and syncs data to the server.
- Manages heating based on server settings or fallback temperature.
- Uses JWT tokens for authentication.

### Uploading Code to the Arduino MKR WiFi 1010

To upload the code to the Arduino, use the Arduino IDE. 

#### Configure the Arduino IDE

1. Install the Arduino IDE: Download and install the Arduino IDE from the official website.
2. Install the Board: Go to Tools -> Board -> Boards Manager. Search for "Arduino SAMD Boards" and install it.
3. Open Library Manager: Go to Sketch -> Include Library -> Manage Libraries.
4. Install the following Libraries: 
   * WiFiNINA
    * Adafruit GFX Library
    *    Adafruit SSD1306
    *    RTClib
    *    MHZ19
    *    LinkedList
    *    Adafruit SHT31

#### Connect Arduino MKR 1010 WiFi
1. Connect the Board: Plug your Arduino MKR 1010 WiFi into your computer using a USB cable.
2. Select the Board: Go to Tools -> Board and select Arduino MKR WiFi 1010.
3. Select the Port: Go to Tools -> Port and select the port corresponding to your connected board (e.g., COM3, /dev/ttyUSB0).

#### Prepare the Sketch
1. Open the Sketch: Open the Arduino sketch file (`.ino`) in the Arduino IDE.
2. Configure the Sketch: Modify the sketch to match your server IP, WiFi credentials, and other settings.

#### Upload the Sketch
1. Verify the Sketch: Click the checkmark icon at the top left of the Arduino IDE to compile and verify the code. This ensures there are no syntax errors.
2. Upload the Sketch: Click the right-arrow icon next to the checkmark to upload the code to the Arduino MKR 1010 WiFi. The IDE will compile the code again and then upload it to the board.

#### Monitor Serial Output
1. Open Serial Monitor: Go to Tools -> Serial Monitor to open the Serial Monitor.
2. Set Baud Rate: Ensure the baud rate at the bottom of the Serial Monitor is set to 9600 to match the Serial.begin(9600); setting in your code.
3. View Output: You should see the output from your Arduino, which includes debug messages and sensor readings.

### Overview of the Arduino Code

#### WiFi and Server Configuration
The following constants hold the WiFi credentials and server details, including URLs for the API endpoints. These have to be adjusted to match your server's IP address and WiFi network.

```
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
```
#### Variables for Operation
```
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
```
These variables and constants manage the operational state, such as connection status, heating status, and timing intervals for the tasks. The `FALLBACK_TEMPERATURE` is used when the server is unreachable, and the thermostat operates in fallback mode. The `HEARTBEAT_INTERVAL` determines how often the Arduino sends heartbeats to the server.

#### Main Loop
The main loop function continuously runs and performs the following tasks:

1. Sends a heartbeat to the server at regular intervals.
2. Enqueues sensor data requests if the heartbeat was successful.
3. Processes any pending requests in the queue.
4. Attempts to reconnect if in fallback mode and sufficient time has passed.
5. Controls the heating relay based on temperature in fallback mode.
6. Updates the display at regular intervals.

#### Helper Functions
##### Enqueue and Process Requests
```	
void enqueueRequest(const String &url, const String &postData, bool isHeartbeat)
{ ... }
void processRequests()
{ ... }
```
##### Network and Server Communication
```	
bool sendAuthenticationRequest(String path, String postData)
{ ... }
bool sendHeartbeatRequest(String path, String postData)
{ ... }
int requestHeatingStatusFromServer(String path)
{ ... }
bool sendSensorDataRequest(String path, String postData)
{ ... }
```
##### WiFi Connection and Reconnection
```	
void connectToWiFi()
{ ... }
void authenticate()
{ ... }
void attemptReconnect()
{ ... }
```
##### Utility and Display Functions
```
String getFormattedDateTime()
{ ... }
void displaySensorData()
{ ... }
```
## Database
For the server of the smart thermostat to function correctly it needs a database. For this we used MariaDb.

### General Database Setup
1. Download and install MariaDB from the official website.
2. Follow the installation wizard to complete the setup.
3. Log into the MariaDB databse.
4. Create a new database:
   ``` CREATE DATABASE sensor_data; ```
5. Create a new user and grant privileges:
    ``` 
    CREATE USER 'sensor_user'@'localhost' IDENTIFIED BY 'password';
    GRANT ALL PRIVILEGES ON sensor_data.* TO 'sensor_user'@'localhost';
    FLUSH PRIVILEGES;
    ```
6. Use the provided SQL script to create tables and insert default data.

### Setup on a Ubuntu Server
1. Install MariaDB:
    ``` 
    sudo apt update
    sudo apt install mariadb-server
    ```

2. Start and Secure MariaDB:
    ``` 
    sudo systemctl start mariadb
    sudo mysql_secure_installation
    ```

3. Create a Database and User:
    ``` 
    sudo mysql -u root -p
    CREATE DATABASE sensor_data;
    CREATE USER 'sensor_user'@'localhost' IDENTIFIED BY 'password';
    GRANT ALL PRIVILEGES ON sensor_data.* TO 'sensor_user'@'localhost';
    FLUSH PRIVILEGES;
    ```
4. Import the SQL script to create tables and insert default data.

## Server Setup and Code Overview

### Frontend (Angular 17)

The frontend is developed using Angular, allowing users to view data and configure the temperature settings.

#### Local Development

1. **Install Node.js and Angular CLI**:
   - Download and install Node.js from the official website. For Angular 17 you can use the following node versions: ^18.13.0 || ^20.9.0.
   - Install Angular CLI globally:
     ```
     npm install -g @angular/cli
     ```

2. **Clone the Repository**:
   - Download the frontend Code from the repository.

3. **Install Dependencies**:
   - Install the necessary npm packages:
     ```
     npm install
     ```

4. **Run the Development Server**:
   - Start the Angular development server:
     ```
     ng serve
     ```
   - The application should be accessible at `http://localhost:4200`.

#### Production Setup on Ubuntu Server

1. **Install Node.js and Angular CLI**:
   - Update package list and install Node.js:
     ```
     sudo apt update
     sudo apt install nodejs npm
     ```
   - Install Angular CLI globally:
     ```
     sudo npm install -g @angular/cli
     ```

2. **Clone the Repository**:
   Either clone the repository to the server and follow the steps below to build the files or copy the built files to the server after building it locally.

3. **Install Dependencies**:
   - Install the necessary npm packages:
     ```
     npm install
     ```

4. **Build the Application**:
   - Build the Angular application for production:
     ```
     ng build --prod
     ```
   - The built files will be in the `dist/` directory.
   - 
5. **Deploy the Built Files**:

    - Copy the contents of the dist directory to
      ```
      /var/www/html:
       ```

6. **Set Up Caddy for SSL Reverse Proxy**:
    Personally I use Caddy as a reverse proxy and for SSL termination. You can use any other reverse proxy you like but caddy is easy to setup and provides SSL out of the box.
    <br>
   - Install Caddy:
     ```
     sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
     curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
     curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
     sudo apt update
     sudo apt install caddy
     ```
   - Configure Caddy for SSL and reverse proxy:
     ```
     sudo nano /etc/caddy/Caddyfile
     ```
     ```
     your-domain.com {
        root * /var/www/html
        file_server
     }
     ```
   - Reload Caddy to apply the new configuration:
     ```
     sudo systemctl reload caddy
     ```

#### Angular Environment Configuration
For the Angular application to communicate with the server in production mode, you need to configure the environment.prod.ts file. This file contains the API URL for the server, which should be updated to match your server's IP address or domain which hosts the backend.

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.lorenz-kraus.com'
};
```


### Backend (Node.js, Express)

The backend is developed using Node.js and Express, providing APIs for sensor data, authentication, and heating control.

#### Local Development

1. **Install Node.js**:
   - Download and install Node.js from the official website.

2. **Clone the Repository**:
   - Download the backend Code from the repository.

3. **Install Dependencies**:
   - Install the necessary npm packages:
     ```
     npm install
     ```

4. **Environment Variables Setup**:
   - Create a `.env` file in your project directory with the following content:
     ```
     APPLICATION_PORT=3000   
     DB_HOST=localhost
     DB_USER=your_mariadb_username
     DB_PASSWORD=your_mariadb_password
     DB_NAME=your_mariadb_database
     JWT_SECRET=your_jwt_secret
     NODE_ENV=production
     ```

5. **Start the Development Server**:
   - Start the Node.js server:
     ```
     node app.js
     ```

#### Production Setup on Ubuntu Server

1. **Install Node.js and npm**:
   - Update package list and install Node.js:
     ```
     sudo apt update
     sudo apt install nodejs npm
     ```

2. **Clone the Repository**:
   - Clone the backend repository to the server and put it in a desired user directory.

3. **Install Dependencies**:
   - Install the necessary npm packages:
     ```
     npm install
     ```

4. **Environment Variables Setup**:
   - Create a `.env` file in your project directory with the following content:
     ```
     APPLICATION_PORT=3000   
     DB_HOST=localhost
     DB_USER=your_mariadb_username
     DB_PASSWORD=your_mariadb_password
     DB_NAME=your_mariadb_database
     JWT_SECRET=your_jwt_secret
     NODE_ENV=production
     ```

5. **Install and Configure PM2**:
   - PM2 is a production process manager for Node.js applications with a built-in load balancer.
     ```
     sudo npm install -g pm2
     ```

6. **Start and Daemonize the Application**:
   - Start the application using PM2:
     ```
     pm2 start app.js
     ```

7. **Auto-Boot PM2 at Server Restart**:
   - Configure PM2 to start on boot:
     ```
     pm2 startup
     ```
   - Follow the instructions provided by PM2, typically:
     ```
     sudo systemctl enable pm2-root
     pm2 save
     ```

8.  **Verify the Application**:
    ```
    pm2 status
    ```

9.  **Check the Logs**:
    ```
    pm2 logs your-app-name
    ```

10. **Save the PM2 List**:
    ```
    pm2 save
    ```

#### Caddy Setup for Reverse Proxy

**Set Up Caddy for SSL Reverse Proxy**:
   - Install Caddy:
     ```
     sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
     curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
     curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
     sudo apt update
     sudo apt install caddy
     ```
   - Configure Caddy for SSL and reverse proxy:
     ```
     sudo nano /etc/caddy/Caddyfile
     ```
     ```
     your-domain.com {
       reverse_proxy localhost:3000
     }
     ```
   - Reload Caddy to apply the new configuration:
     ```
     sudo systemctl reload caddy
     ```

#### Project Structure Overview

- **Controllers**:
  - Located in `src/controllers/`.
  
- **Database**:
  - Located in `src/db/`.

- **Middleware**:
  - Located in `src/middleware/`.

- **Models**:
  - Located in `src/models/`.

- **Routes**:
  - Located in `src/routes/`.

- **Services**:
  - Located in `src/services/`.

- **Main Application File**:
  - `app.js` contains the main application setup and configuration.

#### JWT Authentication

- JWT tokens are used for authentication and are valid for one hour. This is applied to both the web application and the Arduino which uses a normal user created in the database to send data to the server.



