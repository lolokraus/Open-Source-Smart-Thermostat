import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SensorService } from '../../services/sensor.service';
import * as echarts from 'echarts/core';
import { LineChart, ScatterChart } from 'echarts/charts';
import { TooltipComponent, TitleComponent, ToolboxComponent, GridComponent, DataZoomComponent } from 'echarts/components';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { TemperatureReading, HumidityReading, CO2Reading } from '../../models/sensorReadings';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { formatDate } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { HeatingService } from '../../services/heating.service';
import { ToastrService } from 'ngx-toastr';

echarts.use([
  LineChart,
  TooltipComponent,
  TitleComponent,
  ToolboxComponent,
  GridComponent,
  DataZoomComponent,
  CanvasRenderer,
  UniversalTransition,
  ScatterChart
]);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgxEchartsDirective, NgbDropdownModule, FormsModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [provideEcharts()],
})
export class HomeComponent implements OnInit, OnDestroy {

  heatingStatus!: boolean;
  heatingSettings: any = {};

  heatingForm!: FormGroup;

  private chartInstance?: echarts.ECharts;
  chartOption!: EChartsOption;
  selectedSensorType: 'temperature' | 'humidity' | 'co2' = 'temperature';

  startDate: string = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  endDate: string = formatDate(new Date(), 'yyyy-MM-dd', 'en');

  @ViewChild('standardTpl', { static: true }) standardTpl!: TemplateRef<any>;
  @ViewChild('successTpl', { static: true }) successTpl!: TemplateRef<any>;
  @ViewChild('dangerTpl', { static: true }) dangerTpl!: TemplateRef<any>;

  constructor(private sensorService: SensorService, private heatingService: HeatingService, private toastr: ToastrService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.heatingForm = this.fb.group({
      manualActive: [false, Validators.required],
      manualTemperature: ['', Validators.required],
      highTemperature: ['', Validators.required],
      lowTemperature: ['', Validators.required],
      highStart: ['', Validators.required],
      highEnd: ['', Validators.required],
      scheduleActive: [false, Validators.required]
    });

    this.heatingForm.setValidators(this.exclusiveControlValidator('manualActive', 'scheduleActive'));

    this.loadSensorData();
    this.getHeatingSettings();
    this.getHeatingStatus();
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.dispose();
    }
  }

  exclusiveControlValidator(controlName1: string, controlName2: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control as FormGroup;
      const control1 = formGroup.controls[controlName1];
      const control2 = formGroup.controls[controlName2];

      if (!control1 || !control2) {
        return null;
      }

      if ((control1.value && control2.value) || (!control1.value && !control2.value)) {
        return { notExclusive: true };
      }
      return null;
    };
  }

  getHeatingStatus(): void {
    this.heatingService.getHeatingStatus().subscribe({
      next: (data) => {
        this.heatingStatus = data.heatingOn;
      },
      error: (error) => {
        this.toastr.error("Failed to get heating status", error.error.message);
      }
    });
  }

  toggleControl(control: 'manual' | 'schedule'): void {
    const manualControl = this.heatingForm.get('manualActive');
    const scheduleControl = this.heatingForm.get('scheduleActive');

    if (control === 'manual') {
      if (manualControl && scheduleControl) {
        manualControl.setValue(true);
        scheduleControl.setValue(false);
      }
    } else {
      if (manualControl && scheduleControl) {
        manualControl.setValue(false);
        scheduleControl.setValue(true);
      }
    }
  }

  getHeatingSettings(): void {
    this.heatingService.getHeatingSettings().subscribe({
      next: (settings) => {
        this.heatingSettings = settings;
        this.heatingForm.patchValue({
          manualActive: settings.manual_active,
          manualTemperature: settings.manual_temperature,
          highTemperature: settings.high_temperature,
          lowTemperature: settings.low_temperature,
          highStart: settings.high_start,
          highEnd: settings.high_end,
          scheduleActive: settings.schedule_active
        });
      },
      error: (error) => {
        this.toastr.error('Failed to get heating settings', error.error.message);
      }
    });
  }

  updateHeatingSettings(): void {
    if (this.heatingForm.invalid || this.heatingForm.errors?.['notExclusive']) {
      this.toastr.error('Please check the form and try again');
      return;
    }

    const settings = this.heatingForm.value;

    this.heatingService.updateHeatingSettings(settings).subscribe({
      next: (response) => {
        this.toastr.success(response.message);
      },
      error: (error) => {
        this.toastr.error(error.error.message);
      }
    });
  }

  refreshHeatingStatus(): void {
    this.getHeatingStatus();
    this.toastr.success("Refreshed Status");
  }

  loadSensorData(): void {
    let adjustedStartDate = new Date(this.startDate);
    adjustedStartDate.setHours(0, 0, 0, 0);

    let adjustedEndDate = new Date(this.endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    let formattedStartDate = formatDate(adjustedStartDate, 'yyyy-MM-dd HH:mm:ss', 'en');
    let formattedEndDate = formatDate(adjustedEndDate, 'yyyy-MM-dd HH:mm:ss', 'en');

    let params = { startDate: formattedStartDate, endDate: formattedEndDate };
    this.sensorService.getReadings(this.selectedSensorType, params).subscribe((data: TemperatureReading[] | HumidityReading[] | CO2Reading[]) => {
      this.prepareChartData(data);
    });
  }

  onSensorTypeChange(sensorType: 'temperature' | 'humidity' | 'co2'): void {
    this.selectedSensorType = sensorType;
    this.loadSensorData();
  }

  prepareChartData(sensorData: TemperatureReading[] | HumidityReading[] | CO2Reading[]): void {
    let lineChartData = sensorData.map((item: any) => {
      return [item.deviceTimestamp, item.value];
    });

    let heatingData = sensorData
      .filter(item => item.heatingOn)
      .map(item => {
        return {
          name: 'Heating On',
          value: [item.deviceTimestamp, item.value],
          itemStyle: { color: 'red' },
        };
      });

    this.chartOption = {
      tooltip: {
        confine: true,
        trigger: 'axis',
        position: function (pt: any[]) {
          return [pt[0], '10%'];
        },
      },
      title: {
        left: 'center',
        text: 'Sensor Data',
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: 'none',
          },
          restore: {},
          saveAsImage: {},
        },
      },
      xAxis: {
        type: 'time',
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '100%'],
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
        {
          start: 0,
          end: 100,
        },
      ],
      series: [
        {
          name: 'Sensor Value',
          type: 'line',
          smooth: true,
          symbol: 'none',
          areaStyle: {},
          data: lineChartData,
        },
        {
          name: 'Heating On',
          type: 'scatter',
          data: heatingData,
        },
      ],
    };

    const chartDiv = document.getElementById('chart');
    if (chartDiv) {
      if (this.chartInstance) {
        this.chartInstance.dispose();
      }

      this.chartInstance = echarts.init(chartDiv);
      this.chartInstance.setOption(this.chartOption);
    }
  }
}
