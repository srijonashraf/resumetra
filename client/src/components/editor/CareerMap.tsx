import { useState, useRef } from "react";
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { generateCareerMap } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import {
  useStore,
  CareerMapResult,
  CareerPathStep,
} from "../../store/useStore";
import Card from "../ui/Card";
import { Button } from "../ui";

interface GraphNode {
  id: string;
  name: string;
  group: number;
  status: CareerPathStep["status"];
  val: number;
  path: string;
  pathDescription: string;
  difficulty: string;
  timeToGoal: string;
  stepData: CareerPathStep;
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
}

const CareerMap = () => {
  const { isLoggedIn } = useAuth();
  const { analysisResults } = useStore();

  const [graphData, setGraphData] = useState<{
    nodes: GraphNode[];
    links: GraphLink[];
  }>({
    nodes: [],
    links: [],
  });
  const [careerData, setCareerData] = useState<CareerMapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const fgRef = useRef<ForceGraphMethods<GraphNode, GraphLink> | undefined>(
    undefined,
  );

  if (isLoggedIn === false) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card padding="xl" className="text-center">
          <LockClosedIcon className="w-12 h-12 mx-auto text-stone-300 mb-4" />
          <h3 className="text-xl font-semibold font-heading text-stone-900 mb-2">
            Sign in to view your Career Map
          </h3>
          <p className="text-stone-500 mb-6 max-w-md mx-auto">
            Sign in to visualize your career trajectory with personalized paths,
            skill requirements, and timeline projections.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
          >
            Sign In to Continue
          </Link>
        </Card>
      </motion.div>
    );
  }

  const handleGenerate = async () => {
    if (!analysisResults) {
      toast.error("Please analyze a resume first.");
      return;
    }

    if (!analysisResults.analysisId) {
      toast.error(
        "Analysis not saved. Please re-analyze your resume while logged in.",
      );
      return;
    }
    setLoading(true);
    try {
      const { data: result } = await generateCareerMap(
        analysisResults.analysisId,
      );
      setCareerData(result);

      const nodes: GraphNode[] = [];
      const links: GraphLink[] = [];

      result.paths.forEach((path, pathIndex: number) => {
        path.steps.forEach((step, stepIndex: number) => {
          const nodeId = `${pathIndex}-${stepIndex}`;
          nodes.push({
            id: nodeId,
            name: step.role,
            group: pathIndex,
            status: step.status,
            val: stepIndex + 1, // Size based on level
            // Store additional data for tooltips/panels
            path: path.name,
            pathDescription: path.description,
            difficulty: path.difficulty,
            timeToGoal: path.timeToGoal,
            stepData: step,
          });

          if (stepIndex > 0) {
            links.push({
              source: `${pathIndex}-${stepIndex - 1}`,
              target: nodeId,
              label: step.skills_needed?.join(", ") || "Promotion",
            });
          }
        });
      });

      setGraphData({ nodes, links });
    } catch (error) {
      console.error("Failed to generate career map:", error);
      toast.error("Failed to generate career map. Ensure server is running.");
    }
    setLoading(false);
  };

  return (
    <Card shadow className="mt-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-heading">
          Career Map
        </h2>
        <div className="flex items-center gap-3">
          {careerData ? (
            <span className="text-sm text-emerald-600 font-medium">
              Career paths generated
            </span>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Generating..." : "Generate Future Paths"}
            </Button>
          )}
        </div>
      </div>

      <div className="h-[280px] sm:h-[340px] lg:h-[400px] border border-stone-200 rounded-xl overflow-hidden bg-white relative">
        {graphData.nodes.length > 0 ? (
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            nodeLabel="name"
            nodeColor={(node: GraphNode) =>
              node.status === "current"
                ? "#D97706"
                : node.status === "future"
                  ? "#A8A29E"
                  : "#059669"
            }
            nodeRelSize={6}
            linkColor={() => "#D6D3D1"}
            linkWidth={2}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            linkDirectionalParticleWidth={3}
            backgroundColor="transparent"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2 font-heading">
                Visualize Your Career Path
              </h3>
              <p className="text-stone-500 text-sm">
                Click "Generate Future Paths" to see AI-powered career
                trajectory options based on your resume.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      {graphData.nodes.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-600"></div>
            <span className="text-stone-600">Current Role</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-stone-400"></div>
            <span className="text-stone-600">Future Step</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
            <span className="text-stone-600">Goal</span>
          </div>
        </div>
      )}

      {/* Career Path Details */}
      {careerData && (
        <div className="mt-8 space-y-6">
          {/* Current Role & Skills Summary */}
          <div className="bg-stone-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-stone-900 mb-4 font-heading">
              Current Position Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-stone-500 mb-2">
                  Current Role
                </h4>
                <p className="text-xl font-bold text-stone-900">
                  {careerData.currentRole}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-stone-500 mb-2">
                  Current Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {careerData.currentSkills
                    .slice(0, 8)
                    .map((skill, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-white border border-stone-200 rounded-full text-xs text-stone-700"
                      >
                        {skill}
                      </span>
                    ))}
                  {careerData.currentSkills.length > 8 && (
                    <span className="px-2 py-1 bg-stone-200 rounded-full text-xs text-stone-600">
                      +{careerData.currentSkills.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Career Paths Overview */}
          <div>
            <h3 className="text-lg font-semibold text-stone-900 mb-4 font-heading">
              Career Path Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {careerData.paths.map((path, pathIndex: number) => (
                <Card key={pathIndex} shadow padding="sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-stone-900">
                      {path.name}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        path.difficulty === "Low"
                          ? "bg-emerald-50 text-emerald-700"
                          : path.difficulty === "Medium"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                      }`}
                    >
                      {path.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500 mb-3">
                    {path.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span>{path.timeToGoal}</span>
                    <span>{path.steps.length} steps</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* General Recommendations */}
          {careerData.recommendations &&
            careerData.recommendations.length > 0 && (
              <div className="bg-stone-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-stone-900 mb-4 font-heading">
                  Strategic Recommendations
                </h3>
                <ul className="space-y-2">
                  {careerData.recommendations.map((rec, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-start p-3 bg-white rounded-lg border border-stone-200"
                    >
                      <span className="text-amber-600 mr-3 mt-0.5">&rarr;</span>
                      <span className="text-stone-700 text-sm leading-relaxed">
                        {rec}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}
    </Card>
  );
};

export default CareerMap;
