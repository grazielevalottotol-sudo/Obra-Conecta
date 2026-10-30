// Configure as credenciais públicas do projeto Supabase depois de criar o projeto.
const SUPABASE_URL = "https://velvyrfpxoptvogaeggp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__yhSkPROg0pZCDTRKWAywA_QfWTsTAC";
const supabaseReady = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase);
const db = supabaseReady ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const $ = (id) => document.getElementById(id);
const dialogs = ["auth-dialog","budget-dialog","professional-dialog"];
function openDialog(id){ $(id).showModal(); }
$("login-open").onclick = () => { $("auth-title").textContent="Entrar"; $("auth-name").required=false; $("auth-name").parentElement.style.display="none"; openDialog("auth-dialog"); };
$("signup-open").onclick = () => { $("auth-title").textContent="Criar conta"; $("auth-name").required=true; $("auth-name").parentElement.style.display="grid"; openDialog("auth-dialog"); };
["professional-open","professional-open-2"].forEach(id => $(id).onclick=()=>openDialog("professional-dialog"));
$("budget-open").onclick=()=>openDialog("budget-dialog");
document.querySelectorAll(".category").forEach(b=>b.onclick=()=>{ $("search-term").value=b.dataset.category; $("profissionais").scrollIntoView({behavior:"smooth"}); loadProfessionals(b.dataset.category); });

$("search-form").addEventListener("submit",e=>{e.preventDefault();loadProfessionals($("search-term").value);});
async function loadProfessionals(term=""){
  const target=$("professional-list");
  if(!db){target.innerHTML='<div class="empty-state"><span>🌱</span><b>Estamos preparando a rede de profissionais.</b><p>Assim que o banco de dados estiver conectado, os perfis cadastrados aparecerão aqui.</p></div>';return;}
  let query=db.from("professionals").select("name,category,location,description,phone").eq("approved",true).order("created_at",{ascending:false});
  if(term) query=query.ilike("category",`%${term}%`);
  const {data,error}=await query;
  if(error){target.innerHTML='<div class="empty-state"><b>Não foi possível carregar os perfis.</b><p>Tente novamente mais tarde.</p></div>';return;}
  if(!data?.length){target.innerHTML='<div class="empty-state"><span>🌱</span><b>Nenhum profissional encontrado ainda.</b><p>Você pode ser um dos primeiros a se cadastrar.</p></div>';return;}
  target.innerHTML=data.map(p=>`<article class="professional-card"><span class="pill">${escapeHtml(p.category)}</span><h3>${escapeHtml(p.name)}</h3><small>${escapeHtml(p.location)}</small><p>${escapeHtml(p.description||"Profissional cadastrado na Obra Conecta.")}</p>${p.phone?`<a href="https://wa.me/${p.phone.replace(/\D/g,"")}" target="_blank" rel="noopener">Conversar pelo WhatsApp</a>`:""}</article>`).join("");
}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

$("auth-form").addEventListener("submit",async e=>{
 e.preventDefault(); const msg=$("auth-message");
 if(!db){msg.textContent="O banco de dados ainda não foi conectado. Finalize a configuração do Supabase para ativar as contas.";return;}
 const email=$("auth-email").value,password=$("auth-password").value,name=$("auth-name").value,role=$("auth-role").value;
 if($("auth-title").textContent==="Entrar"){
  const {error}=await db.auth.signInWithPassword({email,password});msg.textContent=error?error.message:"Login realizado. Atualize a página para continuar.";
 }else{
  const {data,error}=await db.auth.signUp({email,password,options:{data:{full_name:name,role}}});
  msg.textContent=error?error.message:"Cadastro recebido. Verifique seu e-mail para confirmar a conta.";
 }
});
$("budget-form").addEventListener("submit",async e=>{
 e.preventDefault();const msg=$("budget-message");
 if(!db){msg.textContent="O formulário visual está pronto. Conecte o Supabase para registrar solicitações reais.";return;}
 const {error}=await db.from("budget_requests").insert({name:$("budget-name").value,email:$("budget-email").value,service:$("budget-service").value,location:$("budget-location").value,description:$("budget-description").value});
 msg.textContent=error?error.message:"Solicitação enviada! Obrigado por usar a Obra Conecta.";if(!error)e.target.reset();
});
$("professional-form").addEventListener("submit",async e=>{
 e.preventDefault();const msg=$("pro-message");
 if(!db){msg.textContent="O formulário visual está pronto. Conecte o Supabase para registrar cadastros reais.";return;}
 const {error}=await db.from("professionals").insert({name:$("pro-name").value,email:$("pro-email").value,category:$("pro-category").value,location:$("pro-location").value,description:$("pro-description").value,phone:$("pro-phone").value,approved:false});
 msg.textContent=error?error.message:"Cadastro enviado para análise. Obrigado!";if(!error)e.target.reset();
});
loadProfessionals();
