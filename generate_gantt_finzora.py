import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime, timedelta
import pandas as pd

# Project Tasks for FinZora
tasks = [
    # Phase 1: Planning
    {"Task": "Research & Define Project", "Start": "2026-01-01", "Duration": 5, "Phase": "Planning"},
    {"Task": "Project Synopsis", "Start": "2026-01-06", "Duration": 3, "Phase": "Planning"},
    {"Task": "Requirement Gathering", "Start": "2026-01-09", "Duration": 5, "Phase": "Planning"},
    {"Task": "UI & UX Design", "Start": "2026-01-14", "Duration": 10, "Phase": "Planning"},
    {"Task": "Database & ER Design", "Start": "2026-01-20", "Duration": 7, "Phase": "Planning"},

    # Phase 2: Development
    {"Task": "Authentication Module", "Start": "2026-01-28", "Duration": 5, "Phase": "Development"},
    {"Task": "Transaction Module", "Start": "2026-02-02", "Duration": 8, "Phase": "Development"},
    {"Task": "Stock & Crypto API", "Start": "2026-02-10", "Duration": 8, "Phase": "Development"},
    {"Task": "AI Advisor Integration", "Start": "2026-02-15", "Duration": 10, "Phase": "Development"},
    {"Task": "Price Alert System", "Start": "2026-02-25", "Duration": 7, "Phase": "Development"},
    {"Task": "Budgeting Module", "Start": "2026-03-03", "Duration": 5, "Phase": "Development"},

    # Phase 3: Testing
    {"Task": "Unit Testing", "Start": "2026-03-08", "Duration": 5, "Phase": "Testing"},
    {"Task": "Module Integration", "Start": "2026-03-13", "Duration": 5, "Phase": "Testing"},
    {"Task": "Final System Testing", "Start": "2026-03-18", "Duration": 5, "Phase": "Testing"},

    # Phase 4: Documentation
    {"Task": "Documentation & Report", "Start": "2026-03-23", "Duration": 7, "Phase": "Documentation"},
]

# Convert to DataFrame
df = pd.DataFrame(tasks)
df["Start"] = pd.to_datetime(df["Start"])
df["End"] = df["Start"] + pd.to_timedelta(df["Duration"], unit="D")

# Color mapping
colors = {
    "Planning": "#B4C6E7",  # Light Blue
    "Development": "#B4C6E7", 
    "Testing": "#B4C6E7", 
    "Documentation": "#B4C6E7"
}

# Create Figure
fig, ax = plt.subplots(figsize=(14, 8))

# Plot bars
for i, task in df.iterrows():
    start_date = mdates.date2num(task["Start"])
    end_date = mdates.date2num(task["End"])
    duration = end_date - start_date
    
    # Draw bar
    ax.barh(i, duration, left=start_date, height=0.6, align='center', 
            color=colors[task["Phase"]], edgecolor='black', alpha=0.9)
    
    # Add Task Label next to bar
    ax.text(end_date + 0.5, i, task["Task"], va='center', ha='left', fontsize=9)

# Formatting Axes
ax.set_yticks(range(len(df)))
ax.set_yticklabels(df["Task"], fontsize=10)
ax.invert_yaxis()  # Tasks from top to bottom

# X-Axis Date Formatting (The user specifically asked for Date in the below bar)
ax.xaxis_date()
ax.xaxis.set_major_formatter(mdates.DateFormatter('%d %b')) # e.g., 01 Jan
ax.xaxis.set_major_locator(mdates.DayLocator(interval=5)) # Every 5 days
plt.xticks(rotation=0, fontsize=9)

# Add Grid
ax.grid(True, axis='x', linestyle='--', alpha=0.6)

# Add Vertical Phase Lines (Optional Visual Aid)
# We can add separators between phases if we wanted, but the list is sequential

# Titles and Labels
plt.title("FinZora Project Gantt Chart", fontsize=14, fontweight='bold', pad=20)
plt.xlabel("Timeline (2026)", fontsize=10, fontweight='bold')

# Adjust layout
plt.tight_layout()

# Save
output_path = "finzora_gantt_chart.png"
plt.savefig(output_path, dpi=300)
print(f"Gantt chart saved to {output_path}")
