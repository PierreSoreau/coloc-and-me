import * as RemboursementService from "../services/remboursement.service.js";
import * as DepenseService from "../services/depenses.service.js";
import * as ProfilService from "../services/profil.service.js";

//données en haut de l'écran (dépenses totales du groupe et dette de l'utilisateur)
export const getDebtData = async (req, res) => {
  const groupId = req.query.groupId;
  const token = req.headers.authorization;
  try {
    const uuid = await ProfilService.getUUID(token);

    const debtAmount = await RemboursementService.calculateUserBalance(uuid);
    const totalGroupExpenses = await DepenseService.totalExpenseGroup(groupId);

    return res.status(200).json({
      totalExpenseGroup: totalGroupExpenses,
      totalDebt: debtAmount.debtAmount,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

//dette pour chaque utilisateur de la coloc en liste
export const getallUserBalance = async (req, res) => {
  const groupId = req.query.groupId;
  try {
    const profilData = await ProfilService.getFirstNameAndInitials(groupId);
    const allUserBalance = await RemboursementService.allUserBalance(groupId);

    const finalData = allUserBalance.map((balance) => {
      const sameProfil = profilData.find(
        (profil) => profil.userId === balance.userId,
      );

      return {
        firstname: sameProfil.firstname,
        initials: sameProfil.initials,
        debtAmount: balance.debtAmount,
      };
    });

    return res.status(200).json(finalData);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getAllReimboursementData = async (req, res) => {
  const groupId = req.query.groupId;
  const token = req.headers.authorization;
  const uuid = await ProfilService.getUUID(token);

  try {
    await RemboursementService.insertDebtValue(groupId);

    const allReimboursementData =
      await RemboursementService.getLineRemboursement(uuid);

    return res.status(200).json(allReimboursementData);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
