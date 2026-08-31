import streamlit as st
import time
import uuid

# Set page configuration
st.set_page_config(
    page_title="HealMesh — Autonomous Kubernetes Remediation Cockpit",
    page_icon="🌌",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Cyber-luxury layout styles
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Share+Tech+Mono&display=swap');
    
    .serif-title {
        font-family: 'Cinzel', serif;
        color: #ffffff;
        font-size: 2.8rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        margin-bottom: 0.2rem;
    }
    .mono-sub {
        font-family: 'Share Tech Mono', monospace;
        color: #38bdf8;
        font-size: 0.95rem;
        letter-spacing: 0.2em;
        margin-bottom: 2rem;
    }
    .panel-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        backdrop-filter: blur(10px);
    }
    .status-dot {
        height: 8px;
        width: 8px;
        background-color: #10b981;
        border-radius: 50%;
        display: inline-block;
        margin-right: 8px;
        box-shadow: 0 0 8px #10b981;
    }
    .status-dot-pulse {
        height: 8px;
        width: 8px;
        background-color: #f43f5e;
        border-radius: 50%;
        display: inline-block;
        margin-right: 8px;
        box-shadow: 0 0 12px #f43f5e;
        animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
        0% { transform: scale(0.9); opacity: 0.6; }
        50% { transform: scale(1.2); opacity: 1; }
        100% { transform: scale(0.9); opacity: 0.6; }
    }
</style>
""", unsafe_allow_safe_markdown=True)

# Session State Initialization
if "incidents" not in st.session_state:
    st.session_state.incidents = [
        {
            "id": "1",
            "name": "payment-api-deployment",
            "namespace": "production",
            "type": "CrashLoopBackOff",
            "status": "Awaiting Approval",
            "time": "3m ago",
            "diagnosis": "The database connection pool is exhausted due to an unreleased client connection leak in the middleware. Downstream services are timing out.",
            "action": "SCALE",
            "suggested": "Scale payment-api replica pool from 2 to 4 to distribute connection load while debugging.",
            "confidence": 0.94
        },
        {
            "id": "2",
            "name": "ingress-nginx-controller",
            "namespace": "ingress",
            "type": "OOMKilled",
            "status": "Resolved",
            "time": "15m ago",
            "diagnosis": "Sudden traffic spike exceeded heap allocation memory limits defined in the cgroups specification.",
            "action": "PATCH",
            "suggested": "Patch ingress-nginx memory limits from 512Mi to 1Gi.",
            "confidence": 0.89
        }
    ]

if "logs" not in st.session_state:
    st.session_state.logs = [
        "[14:32:01] Watcher -> Detected CrashLoopBackOff on pods in production namespace.",
        "[14:32:02] Core -> Pydantic payload validated. Dispatching to Gemini prompt engine.",
        "[14:32:04] Core -> Gemini returned diagnosis (Confidence: 94%). Deliver to Slack completed.",
        "[14:32:04] Core -> Remediation Action parsed: SCALE. Lock acquired."
    ]

# Sidebar controls
st.sidebar.markdown("<div class="serif-title" style='font-size: 1.5rem;'>HEALMESH</div>", unsafe_allow_safe_markdown=True)
st.sidebar.markdown("<div class="mono-sub" style='font-size: 0.75rem; margin-bottom: 1.5rem;'>SRE DEMO COCKPIT</div>", unsafe_allow_safe_markdown=True)

st.sidebar.subheader("🕹️ Simulation Controls")
sim_namespace = st.sidebar.selectbox("Kubernetes Namespace", ["default", "production", "staging", "ingress"])
sim_type = st.sidebar.selectbox("Failure Type", ["CrashLoopBackOff", "ImagePullBackOff", "NodeDiskPressure", "CPUThrottle"])
sim_pod = st.sidebar.text_input("Pod Name Prefix", "auth-service")

if st.sidebar.button("Inject Anomaly Event 💥"):
    new_id = str(uuid.uuid4())[:8]
    # Simple templates for mock Gemini output
    diag_map = {
        "CrashLoopBackOff": "Backend container crashed with Exit Code 1. Liveness probes are failing due to a database authentication timeout.",
        "ImagePullBackOff": "Failed to pull image tag 'latest' from private registry. Pull secret authentication token expired.",
        "NodeDiskPressure": "Disk utilization exceeded 85% threshold on node-03 due to unrotated container stdout log files.",
        "CPUThrottle": "Pod is throttled above 98% utilization. Resource limits are configured too low for concurrent webhook load."
    }
    action_map = {
        "CrashLoopBackOff": "REDEPLOY",
        "ImagePullBackOff": "PATCH",
        "NodeDiskPressure": "NONE",
        "CPUThrottle": "SCALE"
    }
    suggested_map = {
        "CrashLoopBackOff": f"Redeploy {sim_pod} using rolling upgrade.",
        "ImagePullBackOff": f"Patch image pull secrets for {sim_pod} with correct registry credentials.",
        "NodeDiskPressure": "Manual clean-up required. No automated script path defined.",
        "CPUThrottle": f"Scale {sim_pod} deployment replicas to 3."
    }
    
    new_inc = {
        "id": new_id,
        "name": f"{sim_pod}-{new_id}",
        "namespace": sim_namespace,
        "type": sim_type,
        "status": "Awaiting Approval",
        "time": "Just now",
        "diagnosis": diag_map[sim_type],
        "action": action_map[sim_type],
        "suggested": suggested_map[sim_type],
        "confidence": 0.92
    }
    st.session_state.incidents.insert(0, new_inc)
    st.session_state.logs.append(f"[{time.strftime('%H:%M:%S')}] Watcher -> Injected simulated {sim_type} event on {sim_pod}-{new_id}")
    st.session_state.logs.append(f"[{time.strftime('%H:%M:%S')}] Core -> Gemini generated diagnosis with Action target: {action_map[sim_type]}")
    st.rerun()

st.sidebar.markdown("---")
st.sidebar.markdown("""
**Documentation References:**
* [Architecture Docs](file:///Users/riyaaggarwal/Desktop/healmesh/docs/)
* [Slack Integration Channel](https://slack.com/)
* [Frontend Live URL](http://localhost:8081/)
""")

# Main Cockpit Page Layout
st.markdown("<div class='serif-title'>HEALMESH</div>", unsafe_allow_safe_markdown=True)
st.markdown("<div class='mono-sub'>AUTONOMOUS INFRASTRUCTURE REMEDIATION DECK</div>", unsafe_allow_safe_markdown=True)

col1, col2 = st.columns([7, 5])

with col1:
    st.subheader("🚨 Active Incidents Stream")
    
    active_incidents = [i for i in st.session_state.incidents if i["status"] == "Awaiting Approval"]
    
    if not active_incidents:
        st.info("🟢 No active incidents awaiting operator approval. Systems healthy.")
    else:
        for inc in active_incidents:
            with st.container():
                st.markdown(f"""
                <div class="panel-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-family: 'Cinzel'; font-size: 1.25rem; font-weight: 700; color: #ffffff;">{inc['name']}</span>
                        <span style="font-family: 'Share Tech Mono'; color: #ef4444; border: 1px solid #ef4444; border-radius: 4px; padding: 2px 8px; font-size: 0.8rem;">{inc['type']}</span>
                    </div>
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-bottom: 1rem;">
                        Namespace: <b>{inc['namespace']}</b> | Time: {inc['time']}
                    </div>
                    <div style="background: rgba(255,255,255,0.02); border-left: 3px solid #38bdf8; padding: 10px; margin-bottom: 1rem; font-size: 0.9rem; line-height: 1.4;">
                        <b>Gemini Diagnosis:</b> {inc['diagnosis']}
                    </div>
                    <div style="background: rgba(168,85,247,0.05); border: 1px solid rgba(168,85,247,0.2); border-radius: 8px; padding: 10px; margin-bottom: 1.2rem; font-size: 0.9rem;">
                        <b>Proposed Remediation [Action: {inc['action']}]:</b> {inc['suggested']}<br>
                        <span style="font-size: 0.8rem; color: #a855f7;">Confidence Score: {int(inc['confidence']*100)}%</span>
                    </div>
                </div>
                """, unsafe_allow_safe_markdown=True)
                
                # Action Approval buttons
                btn_col1, btn_col2 = st.columns(2)
                with btn_col1:
                    if st.button(f"Approve {inc['action']} Action", key=f"app-{inc['id']}"):
                        inc["status"] = "Approved & Executed"
                        st.session_state.logs.append(f"[{time.strftime('%H:%M:%S')}] Operator -> Approved {inc['action']} action for {inc['name']}.")
                        st.session_state.logs.append(f"[{time.strftime('%H:%M:%S')}] Executor -> Executed {inc['action']} command sequence. Verifying health...")
                        st.session_state.logs.append(f"[{time.strftime('%H:%M:%S')}] Executor -> Verification success. {inc['name']} resolved.")
                        st.success(f"Action {inc['action']} approved. Remediation executed successfully.")
                        time.sleep(1)
                        st.rerun()
                with btn_col2:
                    if st.button(f"Reject Proposal", key=f"rej-{inc['id']}"):
                        inc["status"] = "Rejected"
                        st.session_state.logs.append(f"[{time.strftime('%H:%M:%S')}] Operator -> Rejected remediation plan for {inc['name']}.")
                        st.warning("Remediation plan rejected.")
                        time.sleep(1)
                        st.rerun()

with col2:
    st.subheader("🖥️ Event Log & Command Audit")
    
    log_content = "\n".join(st.session_state.logs[::-1])
    st.text_area("Audit Log Output", log_content, height=350, disabled=True)
    
    st.subheader("🛡️ Safety Constraints Enforced")
    st.markdown("""
    * **Namespace Denylist:** Operations inside `kube-system`, `kube-public`, and `healmesh` are completely blocked at the execution level.
    * **Closed Enum Resolution:** Every remediation action parsed by the Gemini response matches `PATCH`, `REDEPLOY`, `SCALE`, or `HELM_UPGRADE`. Any other output defaults to `NONE`.
    * **Operator Approval Required:** Zero actions are executed without manual approval in this dashboard.
    """)
