# FIX ROOT
rm -rf .nx tmp node_modules dist .angular

# FIX SUBDIRECTORIES
root_dirs=("apps" "packages" "serverless")

for root_dir in "${root_dirs[@]}"; do
  if [ -d "$root_dir" ]; then
    cd "$root_dir"
    for dir in */; do
      if [ -d "$dir" ]; then
        cd "$dir"
        rm -rf node_modules .venv dist angular .angular
        cd ..
      fi
    done
    cd ..
  fi
done
