 import React from "react";
 import { describe, it, expect } from "vitest";
 import { render, screen } from "@testing-library/react";
 import userEvent from "@testing-library/user-event";
 import Sidebar from "../Sidebar";
 import { MemoryRouter, Route, Routes } from "react-router";
 import { AuthContext } from "../../features/auth/context/auth.context";
 
 const renderWithProviders = (ui, { route = "/", user } = {}) => {
   const providerValue = { user, loading: false, setUser: () => {}, setLoading: () => {} };
   return render(
     <AuthContext.Provider value={providerValue}>
       <MemoryRouter initialEntries={[route]}>
         {ui}
       </MemoryRouter>
     </AuthContext.Provider>
   );
 };
 
 describe("Sidebar", () => {
   it("renders all navigation links", () => {
     renderWithProviders(<Sidebar isOpen />, { user: { username: "alice", email: "a@x.com" } });
     expect(screen.getByRole("link", { name: /Feeds/i })).toBeInTheDocument();
     expect(screen.getByRole("link", { name: /Profile/i })).toBeInTheDocument();
     expect(screen.getByRole("link", { name: /Saved Posts/i })).toBeInTheDocument();
     expect(screen.getByRole("link", { name: /Notifications/i })).toBeInTheDocument();
   });
 
  it("navigates to the correct route when a link is clicked", async () => {
     const user = userEvent.setup();
    const TestLayout = () => (
      <>
        <Sidebar isOpen />
        <Routes>
          <Route path="/feeds" element={<div data-testid="feeds-page">Feeds Page</div>} />
          <Route path="/profile" element={<div data-testid="profile-page">Profile Page</div>} />
          <Route path="/saved" element={<div data-testid="saved-page">Saved Page</div>} />
          <Route path="/notifications" element={<div data-testid="notifications-page">Notifications Page</div>} />
        </Routes>
      </>
    );
    render(
      <AuthContext.Provider value={{ user: { username: "bob" }, loading: false, setUser: () => {}, setLoading: () => {} }}>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="*" element={<TestLayout />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
 
     await user.click(screen.getByRole("link", { name: /Feeds/i }));
     expect(screen.getByTestId("feeds-page")).toBeInTheDocument();
 
     await user.click(screen.getByRole("link", { name: /Profile/i }));
     expect(screen.getByTestId("profile-page")).toBeInTheDocument();
 
     await user.click(screen.getByRole("link", { name: /Saved Posts/i }));
     expect(screen.getByTestId("saved-page")).toBeInTheDocument();
 
     await user.click(screen.getByRole("link", { name: /Notifications/i }));
     expect(screen.getByTestId("notifications-page")).toBeInTheDocument();
   });
 
   it("displays user details at the bottom", () => {
     renderWithProviders(<Sidebar isOpen />, {
       user: { username: "charlie", email: "charlie@example.com" },
     });
 
     expect(screen.getByRole("region", { name: /User details/i })).toBeInTheDocument();
     expect(screen.getByText("charlie")).toBeInTheDocument();
     expect(screen.getByText("charlie@example.com")).toBeInTheDocument();
   });
 });
 
