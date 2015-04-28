
#
# Why use Makefile?
# because you get help lists & auto-complete on complex commands
#

#NB: avoid having a directory of the same name
helpMe:           ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'


generateHelpImages: ## Iterate Help injection document & generate images for each, then inject into window.html
	cd help; \
	mkdir images; \
	node --version; \
	node compile_diagrams.js

clean: ## remove generated artefacts
	rm -f help/images/*.png
	rm -f testUmlEditorChomeApp.zip

zip: ## create zip file for deployment
	zip -r UmlEditorChomeApp.zip *

build: clean generateHelpImages zip ## run all build tools --- need to automate injection of HTML img list

