# frontend-nanodegree-neighborhood-map
This repository contains a website for Frontend Nanodegree Project 5a Neighborhood Map.

## About this project
This project implements a "Neighborhood Map" web app that displays an editable list of locations along with their corresponding locations on Google Map. The map contains markers to represent each location in the list. Clicking on each location will display info-window that contains information related to that location aggregated from Wikipedia and New York Times.

## How do I run this project?
Per project requirement, the project ships with "dist" directory that contains the distributable version of the web app. To run the app, simply open dist/index.html with Chrome (or equivalent browser).

Alternatively, you can build the project by following the steps below:
1. Check this project out from GitHub.
2. From project root, run `npm install`. This will download all npm dependencies required to build this project.
3. From project root, run `bower install`. This will download all dependencies required to run this project.
4. From project root, run `grunt`. This will build a minified website under `dist` directory.
5. Open dist/index.html with Chrome (or equivalent browser).

## About the features implemented
This project implements the following features:
* Pre-populate the map with 5 locations from Wisconsin.
* Allow adding new locations by typing the name or address of the location in the `Locations` text box and either pressing `ENTER` or `+` button.
* Allow removing existing locations by pressing the `-` button on each location in the list.
* Persist list of locations as JSON in local store.
* Allow real-time filtering of location names by typing into the Filter text box.
* Allow picking case sensitive or insensitive filter by toggling the `Case Sensitive` check-box.
* Display detailed location information in the info window when the list item or map marker is clicked.
  * Location information is pulled asynchronously from Wikipedia and New York Times.
  * Location information displays the first match returned from those websites.
  * When information retrieval fails, an error message is logged in the console log (no visible indicators will be shown on the UI itself.)
  * 
* Markers animate and change color when selected.
