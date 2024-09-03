#!/bin/bash

#github_link commit files_count variants_count nodes_count relationship_count unknown_paths_count unknown_export_relationships_count
vscode=("https://github.com/microsoft/vscode" "b2cc8c48b93222cd9727c4e70be3a269b132e5d8" 3167 0 0 0 0 0)
angular=("https://github.com/angular/angular" "816e76a5789b041fee78ddd278c0e0d19b9a617a" 3101 0 0 0 0 0)
babylonjs=("https://github.com/BabylonJS/Babylon.js" "2b1d8ec3f2143f9dab3422291f2ae31558624dde" 1512 772 76086 95581 1 0)
n8n=("https://github.com/n8n-io/n8n" "e705701cb017c803621e356d35d349432f2886fa" 2671 838 56805 84343 0 0)
azuredatastudio=("https://github.com/microsoft/azuredatastudio" "d9b24522e5c5ab11301ebc9c3addbcedf8e9229b" 0 0 0 0 0 0)
grafana=("https://github.com/grafana/grafana" "a0bea04a02746d622b8b03ab3c9b5f5e75434ede" 1795 155 44340 55252 1 0)

./test_tool_chain.sh  "${grafana[@]}" "${vscode[@]}" "${angular[@]}" "${babylonjs[@]}" "${n8n[@]}" "${azuredatastudio[@]}"
