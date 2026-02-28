 import React from "react";
 
 const OnlineUsers = ({ users = [] }) => {
   return (
     <aside aria-label="Online users">
       <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem", color: "#111827" }}>
         Online
       </h2>
       <ul role="list" style={{ display: "grid", gap: "0.5rem" }}>
         {users.length === 0 ? (
           <li aria-live="polite" style={{ color: "#6b7280" }}>
             No one is online
           </li>
         ) : (
           users.map((u) => (
             <li key={u.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
               <img
                 src={u.avatar}
                 alt=""
                 width="28"
                 height="28"
                 style={{ borderRadius: 9999, objectFit: "cover", background: "#e5e7eb" }}
               />
               <span>{u.name}</span>
             </li>
           ))
         )}
       </ul>
     </aside>
   );
 };
 
 export default OnlineUsers;
 
