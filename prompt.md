Refactor the current index.html to soport multiple Pages and include the next pages:


## Page: List all the videos

This page must list all the videos in the system in pages of 15 and the next features:
- The columns of the list are: name, category
- If the user clic in a record then the system open the Page "Page: Interactive Transcript Player" with the record selected. This page is in the current `index.html` file
- The list of videos come from a JSON service with the next structure:

Example of single json file:

```json
{
    "title": "Aba",
    "category": "music",
    "video_url": "data/aba.mp4",
    "script_url": "data/aba.json"
}
```


## Page: Interactive Transcript Player

This is the current page showed in the current `index.html`:

- Include the title of the current video
- refactor to support reading the video info and script "JSON_SRC" from the passed json in "Page: List all the videos"


