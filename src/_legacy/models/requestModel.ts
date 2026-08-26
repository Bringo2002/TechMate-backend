export interface IServiceRequest {
  id: string;
  userId: string;
  serviceId: string;
  message: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
  updatedAt: Date;
}
