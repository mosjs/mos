# mos-plugin-badges

A mos plugin that adds badges generator to the markdown scope


## Usage

Add this code snippet to your `README.md`

<!&dash;-@badges('travis', 'dependencies')-&dash;>
<br>
<!&dash;-/@-&dash;>

Run `mos` in the terminal.

You'll get the travis and david badges in your readme via [shield.io](http://shields.io/).


## API

* `badges(...badges)`
* `badges.flat(...badges)`
* `badges.flatSquare(...badges)`
* `badges.plastic(...badges)`

The currently supported badges are: travis, dependencies, coveralls, npm.
