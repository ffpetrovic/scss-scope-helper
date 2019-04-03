# scss-scope-helper

A helper extension that adds helper comments next to a closing bracket in SCSS code with the name of the rule to which it belongs.

![Screenshot](/art/screenshot.png)

## Conflicting with other extensions, e.g. GitLens

This extension is based on VSCode decorations. Extensions like GitLens use this feature, meaning that this extension may override some of them.
To temporarily hide helpers from this extension use the 
`SCSS Scope Helper: Hide temporarily` command, 
and `SCSS Scope Helper: Show` to revert.