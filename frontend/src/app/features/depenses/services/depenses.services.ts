import { Injectable, inject } from '@angular/core';
//httpClient permet d'envoyer des requettes http
import { HttpClient } from '@angular/common/http';
//Observable représente le flux de réponse donné par l'api de Node
//tap permet d'agir sur la réponse sans la modifier la stocker par exemple
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';


export interface ExpenseItem {
    expense_amount: number
    expense_date: string
    expense_title: string
    firstname: string
    initials: string
}

export interface ExpenseStats {
    totalExpenseGroup: number
    totalDebt: number
}

export interface ExpensesDataResponse {
    globalStats: ExpenseStats
    finalExpenseList: ExpenseItem[]
}

export interface DebtDataResponse {
    totalExpenseGroup: number,
    totalDebt: number
}

export interface UserBalanceResponse {
    debtAmount: number,
    firstname: string,
    initials: string
}

export interface ReimboursementResponse {
    firstname: string,
    initials: string,
    debtAmount: number,
    type_de_dette: string,
}


@Injectable({
    providedIn: 'root',
})

export class DepensesService {
    private http = inject(HttpClient)
    private apiUrl = "http://localhost:4000/api/depenses"

    getExpensesData(groupId: string): Observable<ExpensesDataResponse> {
        return this.http.get<ExpensesDataResponse>(`${this.apiUrl}/details`, {
            params: { groupId: groupId }
        })
    }

    getDebtData(groupId: string): Observable<DebtDataResponse> {
        return this.http.get<DebtDataResponse>(`${this.apiUrl}/debt-data`, {
            params: { groupId: groupId }
        })
    }

    getallUserBalance(groupId: string): Observable<UserBalanceResponse[]> {
        return this.http.get<UserBalanceResponse[]>(`${this.apiUrl}/balance-data`, {
            params: { groupId: groupId }
        })
    }

    getRemboursementForUser(groupId: string): Observable<ReimboursementResponse[]> {
        return this.http.get<ReimboursementResponse[]>(`${this.apiUrl}/reimboursement-data`, {
            params: { groupId: groupId }
        })
    }


}