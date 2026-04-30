import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ProjectService } from "@/models/ProjectService";
import { DeployProject } from "@/models/DeployProject";
import { DeployServer } from "@/models/DeployServer";
import { Project } from "@/models/Project";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("kalp_auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    verifyToken(token);

    // 1. Fetch all projects to provide common context
    const projectsList = await Project.find().select("name client").populate("client", "name").lean();
    const projectMap = new Map();
    projectsList.forEach((p: any) => {
      projectMap.set(p._id.toString(), {
        name: p.name,
        clientName: p.client?.name || "No Client",
      });
    });

    // 2. Fetch Project Services
    const services = await ProjectService.find().lean();
    const serviceCreds = services.map((s: any) => ({
      id: s._id.toString(),
      type: "Service",
      name: s.name,
      projectName: projectMap.get(s.project.toString())?.name || "Unknown Project",
      clientName: projectMap.get(s.project.toString())?.clientName || "Unknown Client",
      credentials: [
        { key: "Service ID", value: s.serviceId },
        { key: "Password", value: s.servicePass, isSecret: true },
      ],
      updatedAt: s.updatedAt,
    }));

    // 3. Fetch Deployment Projects
    const deployments = await DeployProject.find().lean();
    const deploymentCreds = deployments.map((d: any) => {
      const creds = [];
      if (d.envContent) {
        creds.push({ key: "Env Content", value: d.envContent, isSecret: true, isMultiline: true });
      }
      if (d.envVars) {
        // Convert Map to array of objects
        const vars = d.envVars instanceof Map ? Object.fromEntries(d.envVars) : d.envVars;
        Object.entries(vars).forEach(([k, v]: [string, any]) => {
          creds.push({ key: k, value: String(v), isSecret: true });
        });
      }
      return {
        id: d._id.toString(),
        type: "Deployment",
        name: d.name,
        projectName: d.domain || "Internal",
        clientName: "Internal Deployment",
        credentials: creds,
        updatedAt: d.updatedAt,
      };
    });

    // 4. Fetch Servers
    const servers = await DeployServer.find().lean();
    const serverCreds = servers.map((svr: any) => ({
      id: svr._id.toString(),
      type: "Server",
      name: svr.name,
      projectName: svr.ip,
      clientName: "Infrastructure",
      credentials: [
        { key: "IP Address", value: svr.ip },
        { key: "SSH User", value: svr.sshUser },
        { key: "SSH Port", value: String(svr.sshPort) },
        { key: "Auth Method", value: svr.authMethod },
        { key: "SSH Password", value: svr.encryptedPassword ? "******** (Encrypted)" : "N/A", isSecret: true },
        { key: "SSH Key", value: svr.encryptedKey ? "Private Key Present" : "N/A", isSecret: true },
      ],
      updatedAt: svr.updatedAt,
    }));

    const allCreds = [...serviceCreds, ...deploymentCreds, ...serverCreds].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return NextResponse.json({ creds: allCreds }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
