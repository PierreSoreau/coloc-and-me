import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config();//permet de récupérer les éléments secrets cachés dans le .env
//on récupère la clé et l'url de la db de supabase
const supabaseKey=process.env.SUPABASE_KEY
const supabaseUrl=process.env.SUPABASE_URL

//on exporte les accès pour pouvoir les utiliser partout
export const supabase=createClient(supabaseUrl,supabaseKey);
