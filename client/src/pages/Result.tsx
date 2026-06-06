import { useEffect, useState } from "react";
import type { Project } from "../types";
import { ImageIcon, Info, Loader2Icon, RefreshCwIcon, SparkleIcon, VideoIcon } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GhostButton, PrimaryButton } from "../components/Buttons";
import { useAuth, useUser } from "@clerk/clerk-react";
import api from "../configs/axios";
import toast from "react-hot-toast";
import { assets } from "../assets/assets";

const Result = () => {
    const { projectId } = useParams();
    const { getToken } = useAuth();
    const { user, isLoaded } = useUser();
    const navigate = useNavigate();

    const [project, setProjectData] = useState<Project>({} as Project);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    const fetchProjectData = async () => {
        if (projectId === "demo") {
            setProjectData({
                id: "demo",
                name: "Demo Video Project",
                aspectRatio: "16:9",
                productName: "Demo Product",
                productDescription: "This is a demo product showcase.",
                userPrompt: "Create a video showing the product in action",
                uploadedImages: [assets.product7, assets.model1],
                generatedImage: assets.product7,
                generatedVideo: assets.demo_video,
                isGenerating: false,
                isPublished: false,
                createdAt: new Date().toISOString(),
            } as any);
            setIsGenerating(false);
            setLoading(false);
            return;
        }
        try {
            const token = await getToken();
            const { data } = await api.get(`/api/user/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProjectData(data.project);
            setIsGenerating(data.project.isGenerating);
            setLoading(false);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
            console.log(error);
        }
    };

    const handleGenerateVideo = async () => {
        setIsGenerating(true);
        setTimeout(() => {
            setProjectData((prev) => ({
                ...prev,
                generatedVideo: assets.demo_video,
                isGenerating: false,
            }));
            toast.success("Video generated successfully (Demo Mode)");
            setIsGenerating(false);
        }, 3000);
    };

    useEffect(() => {
        if (projectId === "demo") {
            fetchProjectData();
            return;
        }
        if (user && !project.id) {
            fetchProjectData();
        } else if (isLoaded && !user) {
            navigate("/");
        }
    }, [user, isLoaded, projectId]);

    // Fetch project every 10 seconds
    useEffect(() => {
        if (user && isGenerating) {
            const interval = setInterval(() => {
                fetchProjectData();
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [user, isGenerating]);

    return loading ? (
        <div className="h-screen w-full flex items-center justify-center">
            <Loader2Icon className="animate-spin text-indigo- size-9" />
        </div>
    ) : (
        <div className="min-h-screen  text-white p-6 md:p-12 mt-20">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-medium">Generation Result</h1>
                    <Link to="/generate" className="btn-secondary text-sm flex items-center gap-2">
                        <RefreshCwIcon className="w-4 h-4" />
                        <p className="max-sm:hidden'">New Generation</p>
                    </Link>
                </header>

                {/* grid layout  */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Result Display */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-panel inline-block p-2 rounded-2xl">
                            <div className={`${project?.aspectRatio === "9:16" ? "aspect-9/16" : "aspect-video"} sm:max-h-200 rounded-xl bg-gray-900 overflow-hidden relative`}>
                                {project?.generatedVideo ? <video src={project.generatedVideo} controls autoPlay loop className="w-full h-full object-cover" /> : <img src={project.generatedImage} alt="Generated Result" className="w-full h-full object-cover" />}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        {/* download buttons  */}
                        <div className="glass-panel p-6 rounded-2xl">
                            <h3 className="text-xl font-semibold mb-4">Actions</h3>
                            <div className="flex flex-col gap-3">
                                <a href={project.generatedImage?.replace("/upload", "/upload/fl_attachment")} download>
                                    <GhostButton disabled={!project.generatedImage} className="w-full justify-center rounded-md py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <ImageIcon className="size-4.5" />
                                        Download Image
                                    </GhostButton>
                                </a>
                                <a href={project.generatedVideo?.replace("/upload", "/upload/fl_attachment")} download>
                                    <GhostButton disabled={!project.generatedVideo} className="w-full justify-center rounded-md py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <VideoIcon className="size-4.5" />
                                        Download Video
                                    </GhostButton>
                                </a>
                            </div>
                        </div>

                        {/* generate video button  */}
                        <div className="glass-panel p-6 rounded-2xl relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <VideoIcon className="size-24" />
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-semibold">Video Magic</h3>
                                <div className="group relative">
                                    <Info className="size-4 text-gray-400 hover:text-indigo-400 cursor-help transition-colors" />
                                    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-950 border border-white/10 rounded-lg shadow-xl text-xs text-gray-300 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 leading-normal">
                                        The generation of the video is a sample due to Veo API video restrictions of the free tier. This is just for demo video generated.
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm mb-6">Turn this static image into a dynamic video for social media.</p>
                            {!project.generatedVideo ? (
                                <PrimaryButton onClick={handleGenerateVideo} disabled={isGenerating} className="w-full">
                                    {isGenerating ? (
                                        <>Generating Video...</>
                                    ) : (
                                        <>
                                            <SparkleIcon className="size-4" /> Generate Video
                                        </>
                                    )}
                                </PrimaryButton>
                            ) : (
                                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-center text-sm font-medium">Video Generated Successfully!</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Result;
