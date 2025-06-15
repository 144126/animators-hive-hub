
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import UserProfile from "./pages/UserProfile";
import EditProfile from "./pages/EditProfile";
import PlaylistDetail from "./pages/PlaylistDetail";
import PostDetail from "./pages/PostDetail";
import AnimationDetail from "./pages/AnimationDetail";
import NotFound from "./pages/NotFound";
import CommunitiesPage from "./pages/Communities";
import CommunityPage from "./pages/CommunityPage";
import MainLayout from "./components/MainLayout";

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/playlist/:playlistId" element={<PlaylistDetail />} />
              <Route path="/post/:postId" element={<PostDetail />} />
              <Route path="/animation/:animationId" element={<AnimationDetail />} />
              <Route path="/communities" element={<CommunitiesPage />} />
              <Route path="/c/:communityName" element={<CommunityPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
