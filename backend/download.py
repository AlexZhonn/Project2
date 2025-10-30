import kagglehub

# Download latest version
path = kagglehub.dataset_download("joebeachcapital/us-colleges-and-universities")

print("Path to dataset files:", path)