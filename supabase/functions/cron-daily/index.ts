// 1. Imports Deno (remplacent npm)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { addDays, addWeeks, addMonths, differenceInDays, getDaysInYear, subDays, format } from 'https://esm.sh/date-fns@2'

// 2. Écoute de la requête entrante (C'est ce qui réveille la fonction)
Deno.serve(async (req) => {
  try {
    // 3. Initialisation de Supabase avec les clés secrètes de ton projet
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);


    //Fonction qui permet de remettre au jour suivant une tâche quotidienne/hebdo/mensuelle
    //bimensuelle/ponctuelle qui est en retard au lieu de simplement
    //ne plus la voir alors qu'elle est pas faite

    const currentDate = new Date()
    const yesterdayDate = format(subDays(new Date(), 1), 'yyyy-MM-dd')
    const currentDateString = format(new Date(), 'yyyy-MM-dd')

    const { data: yesterdayTaskUpdate, error: erroryesterdayTaskUpdate } = await supabase
      .from("tasks")
      .update({
        date_limite: currentDateString,
        retard: true
      })
      .eq("status", false)
      //dans le cas ou le serveur plante et ne fait la tache automatisée
      //on lui met less than equal (lte) pour qu'il puisse rattraper son retard
      .lte("date_limite", yesterdayDate)
      .select()


    if (erroryesterdayTaskUpdate) {
      console.error("Erreur de mise à jour des retards :", erroryesterdayTaskUpdate.message);
    }




    //Fonction permettant de créer une nouvelle tâche à période régulière
    //de manière à avoir toujours un an de tâche sur l'application
    //Quelque soit le modèle de la tâche

    const { data: models, error: errorModel } = await supabase
      .from("model_task")
      .select("*")
      .not("frequency", "is", null);

    if (errorModel) throw errorModel;

    let newLastTasksList = [];
    //Pour chaque modèle de tâche
    for (const model of models) {
      //récupération de la tâche la plus éloignée en date par rapport à aujourd'hui
      const { data: lastTask, error: errorlastTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("model_task_id", model.id)
        .order("date_limite", { ascending: false })
        .limit(1)
        .single();



      if (errorlastTask || !lastTask) continue;

      //calcul de l'écart entre la dernière tâche et aujourd'hui



      const lastTaskDate = new Date(lastTask.date_limite);


      const joursDAvance = differenceInDays(lastTaskDate, currentDate);


      //permet d'anticiper les années bisextiles (366 jours au lieu de 365)
      const numberofdaysInYear = getDaysInYear(currentDate);

      if (joursDAvance < numberofdaysInYear) {
        const tableOrderUserTasks = model.profil_id_order;
        const userTask = lastTask.profil_id;

        //on cherche à quelle position est situé userTask
        //dans le tableau des userTasks

        const currentIndex = tableOrderUserTasks.findIndex((p) => p.profil_id === userTask);

        //on sort la prochaine personne à faire la tâche parmi la liste
        //des users
        //on utilise le modulo pour revenir à 0 dans le cas ou le user de la tache
        //actuel correspond au bout du tableau des users
        //exemple: si table[3] correspond au bout du tableau 4%4=0
        const nextIndex = (currentIndex + 1) % tableOrderUserTasks.length;
        const newUserTask = tableOrderUserTasks[nextIndex].profil_id;

        let newdateLimite;

        //calcul de la nouvelle date limite
        if (model.frequency === "quotidienne") newdateLimite = addDays(lastTaskDate, 1);
        else if (model.frequency === "hebdomadaire") newdateLimite = addWeeks(lastTaskDate, 1);
        else if (model.frequency === "bimensuelle") newdateLimite = addWeeks(lastTaskDate, 2);
        else if (model.frequency === "mensuelle") newdateLimite = addMonths(lastTaskDate, 1);

        newLastTasksList.push({
          group_id: model.group_id,
          status: false,
          model_task_id: model.id,
          profil_id: newUserTask,
          date_limite: format(newdateLimite, 'yyyy-MM-dd'),
        });
      }
    }

    //si la liste des nouvelles dernières taches n'est pas vide on les insert dans la base
    //et on les récupère pour les afficher sur via angular
    if (newLastTasksList.length > 0) {
      const { error: errorInsert } = await supabase.from("tasks").insert(newLastTasksList);
      if (errorInsert) throw errorInsert;
      return new Response(JSON.stringify({ success: true, message: `${newLastTasksList.length} tâches ajoutées.` }), { headers: { "Content-Type": "application/json" } });
    } else {
      return new Response(JSON.stringify({ success: true, message: "Aucune tâche à ajouter." }), { headers: { "Content-Type": "application/json" } });
    }
    // --- FIN DE TON SCRIPT ---

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
})