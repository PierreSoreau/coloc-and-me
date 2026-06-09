import * as DepenseService from "../services/depenses.service.js";

export const getExpensesDataController = async (req, res) => {
  const groupId = req.query.groupId;
  const token = req.headers.authorization;

  try {
    const expensesData = await DepenseService.getExpensesData(groupId, token);

    return res.status(200).json(expensesData);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
