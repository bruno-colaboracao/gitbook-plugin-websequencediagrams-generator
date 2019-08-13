# Websequencediagrams.com integration for GitBook

This plugin retrieves the diagram as image when the Gitbook is built.

## Adding the plugin to a Gitbook project

### Install plugin as npm dependency
```bash
npm install gitbook-plugin-websequencediagrams-generator --save
```

### Add the plugin to `book.json` config
```json
{
    "plugins": [ "websequencediagrams-generator"]
}
```

### Optional configuration

* `websequencediagrams-generator-directory`: The directory where the images are saved. Default value: `diagrams`.
* `websequencediagrams-generator-image-prefix`: Filename prefix of the generated images. Default value: `diagram-`.

## Using the plugin

Add a fragment in the [syntax of websequencediagrams.com](https://www.websequencediagrams.com/examples.html) to your book, for example:
```
{% websd style="rose" %}
title Authentication Sequence

Alice->Bob: Authentication Request
note right of Bob: Bob thinks about it
Bob->Alice: Authentication Response
{% endwebsd %}
```

The `style` parameter is optional, and defaults to "default" if not set.

## Test the plugin

Run the following command to test the generation of the diagram:

```bash
npm test
```

It saves an image in the `testoutput` directory.