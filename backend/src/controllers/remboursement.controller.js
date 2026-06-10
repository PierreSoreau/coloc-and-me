import * as RemboursementService from "../services/remboursement.service.js";
import * as DepenseService from "../services/depenses.service.js";
import * as ProfilService from "../services/profil.service.js";

export const getDebtData = async (req, res) => {
  const groupId = req.query.groupId;
  const token = req.headers.authorization;
  try {
    const uuid = await ProfilService.getUUID(token);

    const debtAmount = await RemboursementService.allUserBalance(uuid);
    const totalGroupExpenses = await DepenseService.totalExpenseGroup(groupId);

    return res
      .status(200)
      .json({ totalExpenseGroup: totalGroupExpenses, totalDebt: debtAmount });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getallUserBalance = async (req, res) => {
  const groupId = req.query.groupId;
  try {
    const allUserBalance = await RemboursementService.allUserBalance(groupId);

    return res.status(200).json(allUserBalance);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
