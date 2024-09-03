project_tested="$1"
project_path=test_project/$project_tested
test_file=$project_tested.test.ts 


echo "Running test for: $project_path"

cd app
npm run --silent build

PROJECT_PATH=$project_path node lib/index.js

echo "Go check the result on port 7474"
echo "Corresponding database has been downloaded into db.json"

echo "running test ..."

npm test -- $test_file   
