import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deployment } from './entities/deployment.entity';
import { DeploymentStage } from './entities/deployment-stage.entity';
import { DeploymentInsight } from './entities/deployment-insight.entity';
import { DeploymentLog } from './entities/deployment-log.entity';
import { DeploymentApproval } from './entities/deployment-approval.entity';
import { DeploymentsService } from './deployments.service';
import { DeploymentsController } from './deployments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Deployment,
      DeploymentStage,
      DeploymentInsight,
      DeploymentLog,
      DeploymentApproval,
    ]),
  ],
  controllers: [DeploymentsController],
  providers: [DeploymentsService],
  exports: [DeploymentsService],
})
export class DeploymentsModule {}
