# thingworx-mxgraph
A fork of Petrisor Lacatsu's MXGraph widget

This is a fork of Petrisor Lacatus' MXgraph widget (https://github.com/ptc-iot-sharing/MXGraphDiagramWidgetTWX), working in ThingWorx 8.4.4, Chrome and Firefox. The main changes to that are:
- previous Javascript code that rested in the Mashup for faster development, in the form of codehost widgets, is now embedded in the widget to allow easier usage.
- added another way of mapping between MTP elements and graphical representations (added: ViewType, previously it was only eClassificationClass)
- several bugfixes, in order to work with more MTP files

The widget requires a mapping to exist between eClassificationClass/ViewType and the FQDN of the shape that should be used to represent that element. This needs to be provided as an InfoTable. This repository contains the needed Things+Mashups in the ThingWorxExports.

It is written in Typescript and Visual Studio Code. It is based on the https://github.com/ptc-iot-sharing/ThingworxDemoWebpackWidget and as such read that first in order to see how you set it up.

In the root package.JSON file you will find the thingworxServer, User and Password used when using the upload task.

This Extension is provided as-is and without warranty or support. It is not part of the PTC product suite. Users are free to use, fork and modify them at their own risk. Community contributions are welcomed and can be accepted based on their content.
