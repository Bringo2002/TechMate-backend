import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Proposal, ProposalStatus } from './entities/proposal.entity';
import { CreateProposalDto, UpdateProposalDto, RespondToProposalDto } from './dto/proposal.dto';

@Injectable()
export class ProposalsService {
  constructor(
    @InjectRepository(Proposal)
    private readonly proposalRepo: Repository<Proposal>,
  ) {}

  /**
   * proposal_number is intentionally left unset here — a real BEFORE
   * INSERT trigger already in the schema (generate_proposal_number())
   * assigns it (format PROP-<year>-<sequence>, correctly handling
   * per-year sequencing). Re-reading after save picks up that value,
   * same pattern as Invoice.invoiceNumber/totalAmount.
   */
  async create(dto: CreateProposalDto): Promise<Proposal> {
    const proposal = this.proposalRepo.create(dto);
    const saved = await this.proposalRepo.save(proposal);
    return this.findOne(saved.id);
  }

  async findAll(inquiryId?: string): Promise<Proposal[]> {
    return this.proposalRepo.find({
      where: { ...(inquiryId ? { inquiryId } : {}), deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Proposal> {
    const proposal = await this.proposalRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['inquiry', 'creator'],
    });
    if (!proposal) throw new NotFoundException('Proposal not found');
    return proposal;
  }

  async update(id: string, dto: UpdateProposalDto): Promise<Proposal> {
    const proposal = await this.findOne(id);
    Object.assign(proposal, dto);
    await this.proposalRepo.save(proposal);
    return this.findOne(id);
  }

  /** Marks a draft as sent to the client. */
  async send(id: string): Promise<Proposal> {
    const proposal = await this.findOne(id);
    proposal.status = ProposalStatus.SENT;
    proposal.sentAt = new Date();
    await this.proposalRepo.save(proposal);
    return this.findOne(id);
  }

  /** Client opened the proposal — only moves status forward from 'sent'. */
  async markViewed(id: string): Promise<Proposal> {
    const proposal = await this.findOne(id);
    if (proposal.status === ProposalStatus.SENT) {
      proposal.status = ProposalStatus.VIEWED;
    }
    if (!proposal.viewedAt) {
      proposal.viewedAt = new Date();
    }
    await this.proposalRepo.save(proposal);
    return this.findOne(id);
  }

  /** Client accepts or rejects. */
  async respond(id: string, dto: RespondToProposalDto): Promise<Proposal> {
    const proposal = await this.findOne(id);
    proposal.status = dto.status;
    proposal.respondedAt = new Date();
    proposal.clientNotes = dto.clientNotes ?? proposal.clientNotes;
    if (dto.status === ProposalStatus.REJECTED) {
      proposal.rejectionReason = dto.rejectionReason ?? proposal.rejectionReason;
    }
    await this.proposalRepo.save(proposal);
    return this.findOne(id);
  }

  async withdraw(id: string): Promise<Proposal> {
    const proposal = await this.findOne(id);
    proposal.status = ProposalStatus.WITHDRAWN;
    await this.proposalRepo.save(proposal);
    return this.findOne(id);
  }

  /**
   * Creates a new revision of an existing proposal — schema supports this
   * via version + previous_version_id. Copies content fields, resets
   * status/timestamps, bumps version.
   */
  async createRevision(id: string): Promise<Proposal> {
    const previous = await this.findOne(id);
    const revision = this.proposalRepo.create({
      inquiryId: previous.inquiryId,
      createdBy: previous.createdBy,
      title: previous.title,
      executiveSummary: previous.executiveSummary,
      scopeOfWork: previous.scopeOfWork,
      deliverables: previous.deliverables,
      timelineWeeks: previous.timelineWeeks,
      milestones: previous.milestones,
      assumptions: previous.assumptions,
      exclusions: previous.exclusions,
      totalCost: previous.totalCost,
      paymentSchedule: previous.paymentSchedule,
      paymentTerms: previous.paymentTerms,
      currency: previous.currency,
      version: previous.version + 1,
      previousVersionId: previous.id,
    });
    const saved = await this.proposalRepo.save(revision);
    return this.findOne(saved.id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const proposal = await this.findOne(id);
    proposal.deletedAt = new Date();
    await this.proposalRepo.save(proposal);
    return { message: 'Proposal deleted successfully' };
  }
}
