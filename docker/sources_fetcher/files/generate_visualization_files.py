import os
import shutil
import yaml

from mako.template import Template

d3_directory = "d3"
base_directory = "generated_visualizations"

shutil.copyfile(os.path.join(d3_directory, "symfinder.js"), os.path.join(base_directory, "symfinder.js"))
shutil.copyfile(os.path.join(d3_directory, "style.css"), os.path.join(base_directory, "style.css"))

xps = {}

with open('symfinder.yaml', 'r') as config_file:
    data = yaml.load(config_file.read(), Loader=yaml.FullLoader)
    with open("experiences/" + data["experiencesFile"], 'r') as experiences_file:
        experiences = yaml.load(experiences_file.read(), Loader=yaml.FullLoader)
        for xp_name, xp_config in experiences.items():
            for id in xp_config.get("tagIds", []) + xp_config.get("commitIds", []):
                xp_codename = (xp_name + "-" + str(id)).replace("/", "_")
                xps[xp_codename] = "./{}.html".format(xp_codename)
                xp_html_file_path = os.path.join(base_directory, "%s.html" % xp_codename)
                with open(xp_html_file_path, 'w+') as output_file:
                    output_file.write(Template(filename=os.path.join(d3_directory, "template.html")).render(
                        title=xp_codename,
                        identifier="{} generated by symfinder version {}".format(xp_codename,
                                                                                 os.getenv("SYMFINDER_VERSION")),
                        jsScriptFile=os.path.join("symfinder.js"),
                        filters=",".join(['"' + f + '"' for f in xp_config.get("filters", [])]),
                        jsonFile=os.path.join("data", "%s.json" % xp_codename),
                        jsonStatsFile=os.path.join("data", "%s-stats.json" % xp_codename))
                    )

with open(os.path.join(base_directory, "index.html"), 'w+') as index_file:
    index_file.write(Template(filename=os.path.join(d3_directory, "template-index.html")).render(xps=xps))
