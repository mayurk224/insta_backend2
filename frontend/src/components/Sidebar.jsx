 import React, { useEffect, useMemo, useRef, useState } from "react";
 import { NavLink, useLocation } from "react-router";
 import "./Sidebar.scss";
 import { useAuth } from "../features/auth/hooks/useAuth";
 
 const LINKS = [
   { label: "Feeds", to: "/feeds" },
   { label: "Profile", to: "/profile" },
   { label: "Saved Posts", to: "/saved" },
   { label: "Notifications", to: "/notifications" },
 ];
 
const Sidebar = ({ isOpen, onClose }) => {
   const { user } = useAuth();
   const location = useLocation();
   const listRef = useRef([]);
   const [open, setOpen] = useState(Boolean(isOpen));
 
   useEffect(() => {
     setOpen(Boolean(isOpen));
   }, [isOpen]);
 
   const activeIndex = useMemo(
     () => LINKS.findIndex((l) => location.pathname.startsWith(l.to)),
     [location.pathname],
   );
 
   const onKeyDown = (e) => {
     if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
     e.preventDefault();
     const max = LINKS.length - 1;
     let next = activeIndex >= 0 ? activeIndex : 0;
     if (e.key === "ArrowUp") next = Math.max(0, next - 1);
     if (e.key === "ArrowDown") next = Math.min(max, next + 1);
     if (e.key === "Home") next = 0;
     if (e.key === "End") next = max;
     const el = listRef.current[next];
     if (el) el.focus();
   };
 
   const handleToggle = () => {
     const updated = !open;
     setOpen(updated);
     if (!updated && onClose) onClose();
   };
 
  return (
     <aside
       className="sb-root"
       aria-label="Primary"
      data-open={open}
     >
      {
         <button
           type="button"
           className="sb-toggle"
           aria-controls="sidebar-nav"
           aria-expanded={open ? "true" : "false"}
           onClick={handleToggle}
         >
           {open ? "Close" : "Menu"}
         </button>
      }
 
       <div className="sb-inner">
         <div className="sb-section" aria-hidden="true">
           Navigation
         </div>
         <nav
           id="sidebar-nav"
           className="sb-nav"
           aria-label="Primary navigation"
           onKeyDown={onKeyDown}
         >
           <ul role="list">
             {LINKS.map((l, idx) => (
               <li key={l.to}>
                 <NavLink
                   to={l.to}
                   ref={(el) => (listRef.current[idx] = el)}
                   className={({ isActive }) =>
                     isActive ? "sb-link sb-link-active" : "sb-link"
                   }
                 >
                   {l.label}
                 </NavLink>
               </li>
             ))}
           </ul>
         </nav>
 
         <div className="sb-section" aria-hidden="true">
           Account
         </div>
         <section aria-label="User details" className="sb-user">
           {user?.avatar ? (
             <img src={user.avatar} alt="" className="sb-avatar" />
           ) : (
             <div aria-hidden="true" className="sb-avatar" />
           )}
           <div className="sb-user-meta">
             <span className="sb-user-name">{user?.username || "Guest"}</span>
             <span className="sb-user-email">{user?.email || "—"}</span>
           </div>
         </section>
       </div>
     </aside>
   );
 };
 
 export default Sidebar;
 
