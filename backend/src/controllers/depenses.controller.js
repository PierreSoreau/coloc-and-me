import * as DepenseService from "../services/depenses.service.js";
import * as RemboursementService from "../services/remboursement.service.js";
import { getUUID } from "../services/profil.service.js";

export const getExpensesDataController = async (req, res) => {
  const groupId = req.query.groupId;
  console.log("---------------------------------");
  console.log(
    "🚨 ID du groupe reçu par Node :",
    groupId,
    "| Type :",
    typeof groupId,
  );
  const token = req.headers.authorization;

  try {
    const expensesData = await DepenseService.getExpensesData(groupId, token);

    return res.status(200).json(expensesData);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const addNewExpense = async (req, res) => {
  const groupId = req.query.groupId;
  const article = req.body.article;
  const expenseAmount = req.body.expense_amount;
  const date = req.body.date;
  const token = req.headers.authorization;
  const profilId = await getUUID(token);

  try {
    const expenseData = await DepenseService.newExpense(
      expenseAmount,
      date,
      profilId,
      groupId,
      article,
    );

    return res.status(200).json(expenseData);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const addNewDebt = async (req, res) => {
  const debtAmount = req.body.debt_amount;
  const expenseId = req.body.expenses_id;
  const profilIdTable = req.body.profilIdTable;

  try {
    const debtData = await DepenseService.newDebt(
      profilIdTable,
      debtAmount,
      expenseId,
    );

    return res.status(200).json(debtData);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getInformationExpense = async (req, res) => {
  const expenseId = req.query.expenseId;

  try {
    const expenseData = await DepenseService.getDetailExpense(expenseId);
    const debtData = await DepenseService.getdetailDebt(expenseId);

    return res
      .status(200)
      .json({ expenseData: expenseData, debtData: debtData });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const deleteDataExpense = async (req, res) => {
  const expenseId = req.query.expenseId;
  const groupId = req.query.groupId;
  try {
    await DepenseService.deleteExpense(expenseId);
    await RemboursementService.insertDebtValue(groupId);

    return res.status(200).json({ message: "dépense supprimée avec succès" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
