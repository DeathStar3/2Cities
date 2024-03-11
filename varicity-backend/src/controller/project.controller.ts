import { Body, Controller, Get, Header, Param, Post } from '@nestjs/common';
import { ExperimentResult } from 'src/model/experiment.model';
import { JsonInputInterface } from '../model/jsonInput.interface';
import { ProjectService } from '../service/project.service';

@Controller()
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  @Get('/projects/names')
  getAllProjectsNames(): string[] {
    return this.projectService.getAllProjectsName();
  }

  @Get('/projects/json/:name')
  loadProject(@Param() params): JsonInputInterface {
    return this.projectService.loadProject(params.name);
  }

  @Get('/projects/:name/metrics/external')
  getProjectMetricsExternal(@Param('name') params): string[] {
    return this.projectService.getProjectMetricsExternal(params);
  }

  @Get('/projects/:name/metrics/variability')
  getProjectMetricsVariability(@Param('name') params): string[] {
    return this.projectService.getProjectMetricsVariability(params);
  }

  @Get('/projects/:name/metrics')
  getProjectMetrics(@Param('name') params): string[] {
    return this.projectService.getProjectMetrics(params);
  }

  @Post('/projects')
  @Header('content-type', 'application/json')
  newProject(@Body() experimentResult: ExperimentResult) {
    if (experimentResult.externalMetric !== undefined && experimentResult.externalMetric !== null) {
      experimentResult.externalMetric = new Map(Object.entries(experimentResult.externalMetric),);
    } else {
      experimentResult.externalMetric = new Map()
    }
    this.projectService.addProject(experimentResult);
  }
}