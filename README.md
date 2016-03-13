# simplico
A simplicistic cooperation exercise

## Mission and general data
The former README.md file has been renamed to [MISSION.md](MISSION.md) - all
the general stuff is in there.

## Assignments
In the following list you can see who has an active assignments you can see the
date, assigner, assignee, the topic and the **scope**.

* 20150830-1930: [valango -> MrLehiste: Location events filtering](https://github.com/valango/simplico/issues/23)
<br>SCOPE:`dev/js/location-filter.js`
* 20150830-2120: [valango -> osmay88: Code reformatting](https://github.com/valango/simplico/issues/24)
<br>SCOPE:`lib/routes.js lib/passport.js lib/passport/*.js`
* 20150830-2340: [valango -> valango: WebSockets authentication](https://github.com/valango/simplico/issues/25)
<br>SCOPE:`lib/routes.js lib/slots.js js/ajax.js js/login.js js/sync.js`

Please add comments to corresponding issue for asking any assignment-related
questions, to report results and problems and so on.

## Teamwork rules
In order not to stumble into troubles and not to trouble each other, we need
to play by some clear rules:

1. The **`dev`** branch is where everybody will push his/her contributions strictly
by the ***assigned scope***.
1. Before pushing the results, make sure that your contribution complies with
the [Code Quality Standard](https://github.com/valango/simplico/wiki/C2:-Code-Quality-Standard).
1. To modify any code *outside of your assigned scope*, please ask for
a *consent of the assigner* first - it never hurts to talk!.
1. Only *andriuslokotash* and *valango* may push into `master` and may push into
`dev` outside of their own personal scope. We'll take every possible
precaution in order not to overwrite your personal scope.
1. Use your ***personal branches*** to share new coding ideas,
outside-of-scope results, problems etc. The `ABOUT.md` file containing a
the branch description, should be present.
1. Please delete your *personal branch* when it is no longer needed.
1. The **`master`** branch updates not so often and this will happen only when
contents of `dev` are mature enough.
1. It is highly recommended
[to refresh](https://github.com/valango/simplico/wiki/M9:-On-Git-:-Co-operating#refreshing-the-dev-branch)
your local `dev` branch often!

## Running the App
After fetching / pulling from GitHub:

- run `npm install` and `bower install` - there may have been new packages
included by other contributors;
- add command line option `--initdata=1` when running the server. This will
initialize the database. Without doing this, you can not [Login].
