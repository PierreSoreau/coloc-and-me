import { Injectable, inject } from '@angular/core';
//httpClient permet d'envoyer des requettes http
import { HttpClient } from '@angular/common/http';
//Observable représente le flux de réponse donné par l'api de Node
//tap permet d'agir sur la réponse sans la modifier la stocker par exemple
import { BehaviorSubject, Observable } from 'rxjs';
import { addDays, endOfWeek, endOfMonth, endOfDay, startOfWeek, startOfISOWeek, format, addWeeks, parse } from "date-fns"
import { tap } from 'rxjs';
import { fr } from 'date-fns/locale';



export interface newTaskCredential {
    taskName: string
    taskDescription: string
    frequency: string | null
    date: string | null
    userForTask: string | null
    groupId: string
    ancre: string | null
}



export interface TaskResponse {
    title: string
    description: string
    frequence: string
    date: string
    userTaskId: string
    firstname: string
    status: boolean
    taskId: number
    modelTaskId: number
    fait_le: string
}




@Injectable({
    providedIn: 'root',
})

export class TasksService {
    private http = inject(HttpClient)
    private apiUrl = "http://localhost:4000/api/taches"

    //taskSubject c'est le behaviorSubject qui est entretenu par le service task qui recense les taches de la coloc, ce qu'il contient est transmis
    //en continu aux composants qui lui sont associés via la lecture seule qui s'appelle tasks$
    //le $ est une convention de dev pour dire que c'est une lecture seule de 
    //BehaviorSubject
    private tasksSubject = new BehaviorSubject<TaskResponse[]>([])
    public tasks$ = this.tasksSubject.asObservable()

    private dateTasksSubject = new BehaviorSubject<string[]>([])
    public dates$ = this.dateTasksSubject.asObservable()



    //Les requettes pour récupérer toutes les informations des taches pour
    //la page home-taches

    getAllLimitDateOfTask(groupId: string): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/date-limite`, {
            params: { groupId: groupId }
        });
    }

    getAllTasks(groupId: string): Observable<TaskResponse[]> {
        return this.http.get<TaskResponse[]>(`${this.apiUrl}/all-tasks`, {
            params: { groupId: groupId }
        });
    }


    // remplissage des behaviorsubject (dates et taches)

    loadTasks(groupId: string): void {
        this.getAllTasks(groupId).subscribe({
            next: (data) => {
                // On met à jour le cerveau des tâches
                this.tasksSubject.next(data);
            },
            error: (error) => console.error('Erreur lors du chargement des tâches :', error)
        });
    }

    loadDates(groupId: string): void {
        this.getAllLimitDateOfTask(groupId).subscribe({
            next: (dates) => {
                // On met à jour le cerveau des dates
                this.dateTasksSubject.next(dates);
            },
            error: (error) => console.error('Erreur lors du chargement des dates :', error)
        });
    }



    // chargement en oneshot des data pour la page taches-home
    loadAllDashboardData(groupId: string): void {
        this.loadTasks(groupId);
        this.loadDates(groupId);
    }


    newTask(credential: newTaskCredential): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/new-task`, credential, {
            params: { groupId: credential.groupId }
        }).pipe(
            // Le "tap" permet d'exécuter du code au passage de la réponse 

            // SANS modifier la réponse pour le composant qui a cliqué

            tap((response) => {

                const currentTasks = this.tasksSubject.getValue()

                //permet de construire un tableau même si c'est un ibjet en retour
                const nouvellesTaches = Array.isArray(response) ? response : [response];

                //on insère les deux tableaux dans un autre tableau mais les ... font que 
                //les crochets des tableaux sont flingués
                const newTaskBehaviorSubject = [...nouvellesTaches, ...currentTasks]
                this.tasksSubject.next(newTaskBehaviorSubject)



            }))
    }





    //Fonction de création de l'ancre de repère pour calculer les tâche en occurence
    ancre(frequency: string): Date | null {
        const currentDate = new Date()
        if (frequency === "quotidienne") {
            //le lendemain de la création à minuit
            return endOfDay(addDays(currentDate, 1))
        }

        else if (frequency === "hebdomadaire" || frequency === "bimensuelle") {

            //le dernier jour de la semaine en cours parce qu'on
            //lui a précisé que la semaine débutait le lundi avec 
            //weekstarton:1 et à minuit
            return endOfWeek(currentDate, { weekStartsOn: 1 })
        }

        else if (frequency === "mensuelle") {
            //le dernier jour du mois en cours à minuit
            return endOfMonth(currentDate)
        }

        return null
    }





    //fonction pour récupérer le lundi et dimanche de chaque semaine dans laquelle tu as des tâches
    displayWeek(dateLimiteTable: string[]) {
        let dateTable: { lundi: string, dimanche: string }[] = []
        let dateStartWeek = ""
        let dateEndWeek = ""
        let dateCombinaison = { lundi: "", dimanche: "" }
        for (const date of dateLimiteTable) {
            dateStartWeek = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')
            dateEndWeek = format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')
            dateCombinaison = { lundi: dateStartWeek, dimanche: dateEndWeek }

            //.some() renvoie true si au moins une semaine a déjà ce lundi précis

            const semaineDejaExistante = dateTable.some(semaine => semaine.lundi === dateStartWeek)

            if (!semaineDejaExistante) {
                dateTable.push(dateCombinaison)
            }
        }

        return dateTable
    }

    getCurrentTasks(): TaskResponse[] {
        return this.tasksSubject.getValue()
    }


    updateCurrentWeekDisplay(dateTableforWeeks: { lundi: string, dimanche: string }[],
        currentIndex: number,
    ) {

        const semaineBrute = dateTableforWeeks[currentIndex];
        if (!semaineBrute) {
            return { lundi: "", dimanche: "" }
        }

        const currentWeek = {
            lundi: format(new Date(semaineBrute.lundi), 'd MMMM',
                { locale: fr }),
            dimanche: format(new Date(semaineBrute.dimanche), 'd MMMM',
                { locale: fr }),
        }

        return currentWeek


    }

    updateCurrentWeekTasks(dateTableforWeeks: { lundi: string, dimanche: string }[], currentIndex: number, taskDatas: TaskResponse[]) {
        const semaineBrute = dateTableforWeeks[currentIndex]

        if (!semaineBrute) {
            return []
        }
        const lundi = new Date(semaineBrute.lundi)
        const dimanche = new Date(semaineBrute.dimanche)

        const tasksListOfWeek = taskDatas.filter((data) => {
            const dateTask = new Date(data.date)

            //on ne renvoit uniquement les taches qui ont une date limite comprise entre
            //le lundi et le dimanche de la semaine en cours sur l'affichage
            return dateTask >= lundi && dateTask <= dimanche
        })

        return tasksListOfWeek




    }

    //permet de générer toutes les semaines de l'année en cours

    generateWeeksCalendar() {
        let dateTable: { lundi: string, dimanche: string }[] = [];


        // On commence le 1er janvier de l'année demandée
        let current = new Date(new Date().getFullYear(), 0, 1);

        let end = new Date(new Date().getFullYear() + 1, 11, 31);


        while (current <= end) {
            dateTable.push({
                lundi: format(startOfWeek(current, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
                dimanche: format(endOfWeek(current, { weekStartsOn: 1 }), 'yyyy-MM-dd')
            });
            // On passe à la semaine suivante
            current = addWeeks(current, 1);
        }
        return dateTable;
    }

    updateTaskStatus(date: string, taskId: number, status: boolean): Observable<TaskResponse> {
        return this.http.put<TaskResponse>(`${this.apiUrl}/update-task-status`, { date, taskId, status }).pipe(
            // Le "tap" permet d'exécuter du code au passage de la réponse 

            // SANS modifier la réponse pour le composant qui a cliqué

            tap((response) => {

                const currentTasks = this.tasksSubject.getValue()

                const newcurrentTasks = currentTasks.map((task) => {

                    if (task.modelTaskId === response.modelTaskId) {
                        return response
                    }

                    else {
                        return task
                    }
                })

                this.tasksSubject.next(newcurrentTasks)



            }))
    }

    deleteExpense(groupId: string, expenseId: number): Observable<string> {
        return this.http.delete<string>(`${this.apiUrl}/delete-expense`, {
            params: { expenseId: expenseId, groupId: groupId }
        })
    }

    deleteTask(taskId: number, frequency: string | null): Observable<TaskResponse> {


        const parametres: any = { taskId: taskId };

        // 2. On ajoute la fréquence uniquement si elle n'est pas nulle
        if (frequency) {
            parametres.frequence = frequency;
        }

        return this.http.delete<TaskResponse>(`${this.apiUrl}/delete-task`, {
            params: parametres
        }).pipe(tap((response) => {

            const currentTasks = this.tasksSubject.getValue()

            const newcurrentTasks = currentTasks.filter((task) => {

                return task.modelTaskId !== response.modelTaskId
            })

            this.tasksSubject.next(newcurrentTasks)



        }))
    }

    deleteallTask(taskId: number): Observable<TaskResponse[]> {
        return this.http.delete<TaskResponse[]>(`${this.apiUrl}/delete-all-task`, {
            params: { taskId: taskId }
        }).pipe(tap((response) => {

            const currentTasks = this.tasksSubject.getValue()

            const newCurrentTasks = currentTasks.filter((task) => {
                return task.taskId !== taskId;
            });

            this.tasksSubject.next(newCurrentTasks)



        }))
    }

    getTaskById(taskId: number): Observable<TaskResponse> {
        return this.http.get<TaskResponse>(`${this.apiUrl}/get-task`, {
            params: { taskId: taskId }
        })

    }

    updateTaskDetail(taskId: number, comments: string, title: string, date: string | null, profilId: string | null, frequence: string | null): Observable<TaskResponse | TaskResponse[]> {
        return this.http.put<TaskResponse | TaskResponse[]>(`${this.apiUrl}/update-task`, { comments, title, date, profilId, frequence }, {
            params: { taskId: taskId }
        }).pipe(tap((response) => {

            const currentTasks = this.tasksSubject.getValue()
            const newTaskArray = Array.isArray(response) ? response : [response]

            const newcurrentTasks = currentTasks.map((task) => {

                const match = newTaskArray.find((item) => item.modelTaskId === task.modelTaskId)

                return match ? match : task

            })

            this.tasksSubject.next(newcurrentTasks)

        }))

    }

    //----------------------------------------------------------------------
    //fonction qui permet de mettre à jour la fréquence d'un modèle de tache
    //d'abord suppression des occurrences de tâche situées après la date d'aujourd'hui
    //ensuite ajout des nouvelles taches à la fréquence définie 
    //----------------------------------------------------------------------

    deleteTasksAfterCurrentDay(modelTaskId: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/delete-tasks-after-current-day`, {
            params: { taskId: modelTaskId }
        }).pipe(tap((response) => {


            const currentTasks = this.tasksSubject.getValue()

            const newCurrentTasks = currentTasks.filter((task) => {

                if (task.taskId !== modelTaskId) {
                    return true
                }

                //on met la date d'aujourd'hui à minuit et la date comparée
                //du tableau à minuit aussi pour être sur de comparer à heure comparable
                //sinon une date du tableau à 16h50 sera plus tard que minuit date du controle
                const currentDate = new Date()
                currentDate.setHours(0, 0, 0, 0)

                const taskDate = new Date(task.date)

                taskDate.setHours(0, 0, 0, 0)

                return taskDate <= currentDate


            });

            this.tasksSubject.next(newCurrentTasks)

        }))
    }

    newTasksForModelAfterToday(modelTaskId: number): Observable<TaskResponse[]> {
        return this.http.post<TaskResponse[]>(`${this.apiUrl}/create-tasks-after-current-day`, { taskId: modelTaskId })
            .pipe(tap((response) => {

                const currentTasks = this.tasksSubject.getValue()

                const newCurrentTasks = [...currentTasks, ...response]


                this.tasksSubject.next(newCurrentTasks)


            }))
    }

    //----------------------------------------------------------------------

    //----------------------------------------------------------------------
}



