// Supabase 연결. publishable 키는 브라우저에 공개돼도 되는 키이고, 데이터 보호는 RLS(supabase/schema.sql)가 담당함
const SB_URL="https://gkvkeiycobpzhxzujeqm.supabase.co";
const SB_KEY="sb_publishable_emw29rrJ0GbNRAJn6P4fpA_I0k1nSU8";

window.RDB=window.supabase?(()=>{
  const sb=window.supabase.createClient(SB_URL,SB_KEY);
  const ok=({data,error})=>{if(error)throw error;return data};
  const back=()=>/^https?:$/.test(location.protocol)?location.origin+location.pathname:undefined;
  return{
    sb,
    async user(){const{data}=await sb.auth.getSession();return data.session?data.session.user:null},
    async signIn(email,password){ok(await sb.auth.signInWithPassword({email,password}))},
    // 메일 인증이 켜져 있으면 session 없이 돌아옴. 메일 링크는 웹 주소로 열었을 때만 이 페이지로 돌아오게 함
    async signUp(email,password){return ok(await sb.auth.signUp({email,password,options:{emailRedirectTo:back()}}))},
    async resetPassword(email){ok(await sb.auth.resetPasswordForEmail(email,{redirectTo:back()}))},
    async updatePassword(password){ok(await sb.auth.updateUser({password}))},
    async signOut(){await sb.auth.signOut()},
    async isAdmin(){
      const u=await this.user();if(!u)return false;
      const{data}=await sb.from("admins").select("user_id").eq("user_id",u.id);
      return !!(data&&data.length);
    },
    async list(module,kind){return ok(await sb.from("items").select("*").eq("module",module).eq("kind",kind).order("created_at",{ascending:false}).limit(200))},
    async add(row){ok(await sb.from("items").insert(row))},
    async remove(id){ok(await sb.from("items").delete().eq("id",id))},
    guestbook:{
      async list(){return ok(await sb.from("guestbook").select("*").order("created_at",{ascending:false}).limit(200))},
      async add(name,message){ok(await sb.from("guestbook").insert({name,message}))},
      async remove(id){ok(await sb.from("guestbook").delete().eq("id",id))}
    }
  };
})():null;
