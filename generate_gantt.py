
import matplotlib.pyplot as plt

# Data from the user's Gantt chart image/text
tasks = [
    ("Requirement Gathering & Analysis", 1, 1),   # Start week 1, Duration 1
    ("System Design & Architecture", 2, 2),       # Start week 2, Duration 2
    ("Frontend Setup (React + Next.js)", 3, 2),   # Start week 3, Duration 2
    ("Backend Setup (Convex, APIs)", 4, 2),       # Start week 4, Duration 2
    ("Login/Signup Module", 5, 1),                # Start week 5, Duration 1
    ("Video Call & Screen Share Module", 6, 2),   # Start week 6, Duration 2
    ("Coding Test Module", 7, 1),                 # Start week 7, Duration 1
    ("Scheduling & Calendar Module", 8, 1),       # Start week 8, Duration 1
    ("Meeting Recording & Storage", 9, 1),        # Start week 9, Duration 1
    ("Candidate Review Module", 10, 1),           # Start week 10, Duration 1
    ("Testing & Bug Fixing", 11, 1),              # Start week 11, Duration 1
    ("Deployment & Documentation", 12, 1)         # Start week 12, Duration 1
]

# Unpack data
task_names = [t[0] for t in tasks]
start_weeks = [t[1] for t in tasks]
durations = [t[2] for t in tasks]

# Create figure and axis
fig, ax = plt.subplots(figsize=(10, 6))

# Create horizontal bars
# y-positions: 0, 10, 20... spacing them out
y_positions = range(len(tasks) * 10, 0, -10)

# Plot bars
# 'left' parameter defines the starting x-position
ax.barh(y_positions, durations, left=start_weeks, align='center', height=8, color='skyblue', edgecolor='black')

# Set Labels
ax.set_yticks(y_positions)
ax.set_yticklabels(task_names)
ax.set_xlabel('Weeks (June → September)')
ax.set_ylabel('Tasks')
ax.set_title('Gantt Chart: Video Conferencing Project')

# Set X-axis limits and ticks
ax.set_xlim(0, 14)
ax.set_xticks(range(1, 14))

# Add grid
ax.grid(True, axis='x', linestyle='--', alpha=0.7)

# Adjust layout to prevent label cutoff
plt.tight_layout()

# Save
plt.savefig('gantt_chart_matplotlib.png', dpi=300)
print("Chart saved as gantt_chart_matplotlib.png")
