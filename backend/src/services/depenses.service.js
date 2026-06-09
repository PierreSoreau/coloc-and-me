import { supabase } from "../config/supabase.js";
import { getUUID, getNameById } from "./profil.service.js";
import { calculateUserBalance } from "./remboursement.service.js";

export const totalExpenseGroup = async (groupId) => {
  let expensesGroupValue = 0;
  const { data: expensesGroup, error: errorExpenses } = await supabase
    .from("expenses")
    .select("expense_amount")
    .eq("group_id", groupId);

  if (errorExpenses) {
    throw new Error(
      `Erreur lors de la récupération des montants de dépense:${errorExpenses.message}`,
    );
  }

  for (const expense of expensesGroup) {
    expensesGroupValue += expense.expense_amount;
  }

  return expensesGroupValue;
};

export const getExpensesData = async (groupId, token) => {
  const uuid = await getUUID(token);
  const debt = await calculateUserBalance(uuid);
  const totalGroupExpenses = await totalExpenseGroup(groupId);
  const { data: expensesData, error: expensesError } = await supabase
    .from("expenses")
    .select(
      `expense_amount,
      date,
      article,
      profils(firstname, lastname)`,
    )
    .eq("group_id", groupId);

  if (expensesError) {
    throw new Error(
      `Erreur lors de la récupération des données de dépenses:${expensesError.message}`,
    );
  }

  const finalExpenseData = expensesData.map((expense) => {
    const firstInitial = expense.profils.firstname.charAt(0).toUpperCase();
    const lastInitial = expense.profils.lastname.charAt(0).toUpperCase();

    return {
      expense_amount: expense.expense_amount,
      expense_date: expense.date,
      expense_title: expense.article,
      firstname: expense.profils.firstname,
      initials: `${firstInitial}${lastInitial}`,
    };
  });

  return {
    globalStats: {
      totalExpenseGroup: totalGroupExpenses,
      totalDebt: debt.debtAmount,
    },
    finalExpenseList: finalExpenseData,
  };
};
