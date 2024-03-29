import { Request, Response } from "express";

class MedicalRecordController {
  static async createMedicalRecord(req: Request, res: Response) {}

  static async getMedicalRecordById(req: Request, res: Response) {}

  static async getAllMedicalRecords(req: Request, res: Response) {}

  static async getCurrentUserMedicalRecords(req: Request, res: Response) {}

  static async updateMedicalRecord(req: Request, res: Response) {}

  static async deleteMedicalRecord(req: Request, res: Response) {}
}

export default MedicalRecordController;
