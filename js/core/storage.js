
const STORAGE_KEYS = {
  USERS: "exam_users",
  EXAMS: "exam_exams",
  RESULTS: "exam_results",
  SESSION: "exam_session",
};


// generate Id 
function generateId(prefix) {
  const counterKey = `counter_${prefix}`;                          
  const current = Number(localStorage.getItem(counterKey)) || 0;   
  const next = current + 1;                                        
  localStorage.setItem(counterKey, next);                         
  return `${prefix}_${next}`;                                     
}

// 
function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch (err) {
    console.error("storage.js: failed to parse JSON, using fallback", err);
    return fallback;
  }
}

//users general
function getUsers(){
    return safeParse(localStorage.getItem(STORAGE_KEYS.USERS),[]);
}
function saveUsers(users){
    localStorage.setItem(STORAGE_KEYS.USERS,JSON.stringify(users))
}

function addUser(user){
    const users=getUsers();
    const newUser={id:generateId("u"),...user}
    users.push(newUser);
    saveUsers(users);
    return newUser;
}

//student
function getStudents(){
  return getUsers().filter((u)=>u.role==="Student")
}

function addStudent(user){
return addUser({...user,role:"Student"})
}




//teacher
function getTeacher(){
  return getUsers().filter((u)=>u.role==="Teacher")
}
function addTeacher(user){
return addUser({...user,role:"Teacher"})
}






// who is logged in
function setSession(user) {
  const session = { id: user.id, role: user.role };
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  return session;
}

function getSession() {
  return safeParse(localStorage.getItem(STORAGE_KEYS.SESSION), null);
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

function isLoggedIn() {
  return getSession() !== null;
}

function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  return getUserById(session.id);
}