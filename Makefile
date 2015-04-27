
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


