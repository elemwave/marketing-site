# Marketing Home

The home page is the public entry point of the Elemwave marketing website. It
presents the product, its software capabilities, a call to book a meeting, and
the science behind it.

### Requirement: Home page is publicly reachable

The system SHALL serve the home page at the site root without authentication.

#### Scenario: Visitor opens the site root
- **WHEN** a visitor requests the site root path
- **THEN** the system responds successfully and renders the home page

### Requirement: Home presents all primary sections

The home page MUST present, in order, the hero, the applications section
headed "The challenges", the software capabilities section, the science section,
the book-a-meeting call to action, the certifications section, and the footer. The order is the same on every screen
size, and assistive technology and keyboard focus meet the sections in that
same order.

#### Scenario: Visitor scrolls the home page
- **WHEN** the home page has loaded, on a phone, a tablet or a desktop screen
- **THEN** the hero heading, "The challenges", "Our Solution",
  "Peer-Reviewed Publications", "Book a Meeting", "Certifications", and the
  footer appear in that order from top to bottom

#### Scenario: Visitor reaches the call to action after the publications
- **WHEN** a visitor reads or tabs through the home page
- **THEN** they meet "Book a Meeting" and its "Schedule a Call" control after
  "Peer-Reviewed Publications" and before "Certifications"

### Requirement: Home presents a Certifications section

The home page MUST present a Certifications section, positioned after the
book-a-meeting call to action as the last section before the footer, fitting
within the screen's width, showing every current
certification with its name, subtitle, body text, seal image and its own
certificate and annex documents. Adding a further certification MUST NOT
require a layout or code change.

#### Scenario: Visitor views the Certifications section
- **WHEN** the home page has loaded
- **THEN** each certification shows its name, subtitle, body text and seal
  image
- **AND** each seal image is labelled "\<certification name\> seal"

#### Scenario: Visitor opens a certification's documents
- **WHEN** the visitor activates a certification's "Certificate" control
- **THEN** that certification's own certificate document opens in a new tab
- **AND WHEN** the visitor activates that certification's "Annex" control
- **THEN** that certification's own annex document opens in a new tab
- **AND** neither control opens another certification's documents

### Requirement: The hero shows its heading and subheading

The hero SHALL show its heading, "Know what your platform emits, withstands and
reflects.", as the page's single main heading, and directly beneath it the
subheading "Elemwave predicts it even before a prototype exists, with
open-source, peer-reviewed simulations that you can verify.", on its dark
band. Both are written in sentence case, as given. The subheading is set
smaller and lighter than the heading, its text contrasts with the band by at
least 4.5 to 1, and it is ordinary text, not a further heading, so the page's
outline of section headings is unchanged. The former headline's words appear
nowhere in the hero, and neither does the previous heading, "What does your
platform emit, withstand and reflect?". The hero shows no picture of an airplane or anything else:
no picture, placeholder, empty box or loading mark stands beside or beneath the
two texts. Each text is centred across the hero, and the pair is centred down
it, and neither is cut off, overlapped or hidden however many lines it wraps
onto. Wherever the heading and subheading fit within the height the hero had
while it held its former headline alone, the hero MUST be exactly that tall, so
the sections below it start where they did; where they need more room, on the
narrowest screens or with a visitor's text enlarged, the hero grows by no more
than they need, and both are still shown in full at their usual size. The site
neither shows nor publishes the hero's former airplane pictures. Nothing in the
hero moves, so it offers no pause or resume control, and assistive technology
meets the heading first and then the subheading.

#### Scenario: Visitor opens the home page
- **WHEN** a visitor opens the home page on a phone, a tablet or a desktop
  screen
- **THEN** the hero shows the heading, centred, with the subheading centred
  directly beneath it, and no airplane picture
- **AND** the hero is as tall as it was while it held its former headline
  alone, so the next section starts where it did

#### Scenario: The opening needs more room than the hero's former height
- **WHEN** the heading and subheading together need more height than the hero
  had, on the narrowest screens or with the visitor's text enlarged
- **THEN** the hero grows by only what they need, and neither text is cut off,
  shrunk or hidden

#### Scenario: The home page is still loading or runs no scripts
- **WHEN** the home page is still loading, or the visitor's browser runs no
  scripts
- **THEN** the hero shows the heading and the subheading as part of the page's
  first view, with no placeholder, empty box or loading mark in their place
- **AND** the page asks the browser to fetch no airplane picture for the hero

#### Scenario: Visitor waits on the hero
- **WHEN** the hero has been visible for any length of time
- **THEN** it still shows the heading and subheading, and no picture ever
  appears

#### Scenario: Visitor activates the hero
- **WHEN** a visitor activates the hero, once or repeatedly
- **THEN** nothing changes and no pause or resume control is presented

#### Scenario: Visitor leaves the home page and returns
- **WHEN** a visitor leaves the home page and returns to it, or reloads it
- **THEN** the hero again shows the same heading and subheading

#### Scenario: Visitor uses assistive technology or prefers reduced motion
- **WHEN** a visitor moves through the hero with a screen reader, or their
  system asks for reduced motion
- **THEN** they meet the heading and then the subheading, as text and not as a
  further heading, and no image, image description or "A320 CAD model" label

#### Scenario: Someone asks for the former hero picture
- **WHEN** anyone asks the site for the A320 CAD-model picture the hero used to
  show
- **THEN** the site answers that the picture does not exist

### Requirement: Item tabs switch the active item

The "The challenges" and "Our Solution" sections MUST each let the visitor
select one of their item tabs and show that tab's title, body paragraphs, and
picture. Neither section shows an item until the visitor chooses a tab.
Selecting an item in one section leaves the other section's selection
unchanged, whether that section shows an item or none.

#### Scenario: Visitor opens the home page before choosing an item
- **WHEN** the home page has loaded, or is reloaded, or the visitor leaves it
  and returns to it, including by the browser's Back button, and the visitor
  has not chosen a tab in a section
- **THEN** that section shows its tabs alone, in their usual order with their
  usual labels, and no tab in it is indicated as selected
- **AND** it shows no item title, paragraphs or picture, and no empty frame or
  placeholder where the item would be, not even briefly before the page's
  scripts have run
- **AND** neither section causes the page to scroll

#### Scenario: Visitor selects a tab
- **WHEN** the visitor activates an item tab
- **THEN** that tab becomes the active tab
- **AND** the card shows the selected tab's title, paragraphs, and picture
  area, which shows an image for most items and, for a video item, the
  thumbnail or the animation

#### Scenario: Activating a tab brings its item into view
- **WHEN** the visitor activates an item tab, by pointer, touch (on its
  circle picture or its label) or keyboard, and the
  section's item card is not wholly inside the window — as when the tabs wrap
  onto several rows on a laptop-sized window
- **THEN** the page scrolls just far enough to bring the item card into view,
  smoothly, or at once when the visitor's system asks for reduced motion
- **AND** keyboard focus stays on the activated tab
- **AND WHEN** the item card is already wholly inside the window
- **THEN** the page does not move

#### Scenario: On a phone the tab circles stand in an even grid
- **WHEN** either section is shown in a window narrower than 640 px
- **THEN** every tab takes the same width, a third of the row, so the circles
  stand in rows of three on shared column centres, with a last row of fewer
  than three centred
- **AND** each label is centred under its circle and wraps rather than
  widening its tab, and no tab overlaps another or leaves the screen
- **AND** at 640 px and wider each tab is as wide as its label, as before

#### Scenario: Assistive technology reads the item tabs
- **WHEN** either section's items are shown, at any point
- **THEN** no tab is indicated as selected before the visitor has chosen one;
  once an item is shown, exactly one of that section's item tabs is indicated
  as selected, both visually and to assistive technology, and it is the tab
  whose title, paragraphs and picture area are shown
- **AND WHEN** the visitor chooses a tab for the first time, or selects a
  different tab
- **THEN** assistive technology is informed that the shown title, paragraphs
  and picture area have changed

#### Scenario: Named software in the section is a link
- **WHEN** the section names a piece of software in the place its tab links
  it: FreeCAD in The Workbench tab, opensemba/fdtd in the FDTD solver tab,
  opensemba/dgtd in the DGTD solver tab, opensemba/tulip in the Cable Solver
  tab, FreeCAD, Gmsh and opensemba in the Open and auditable tab, or ngspice
  in the SPICE coupling tab
- **THEN** that name is a link to the software's own site, opening in a new tab
- **AND** the link is reachable and activated with the keyboard like any other link
- **AND** a name a tab mentions in another place, such as ngspice or The
  Workbench in the FDTD solver tab, is plain text, and no tab names or links
  ParaView

### Requirement: The challenges presents the applications Our Solution answers

The home page SHALL present, straight after the hero, a section headed
"The challenges" (anchor `#problems`) offering five applications — radiated emissions,
radiated immunity, conducted susceptibility, lightning and radar cross
section — each opening with the problem it poses and readable on its own,
without the visitor having read any other item; an item may name an item of
Our Solution but need not. Radiated
emissions, radiated immunity and conducted susceptibility each show Elemwave's
own simulation as an animation published with the site, played once the
visitor chooses the item.

#### Scenario: Visitor opens the home page at The challenges
- **WHEN** the home page has loaded
- **THEN** The challenges offers exactly five items, each with the same label
  on its tab and as its title, in this order: Radiated emissions, Radiated
  immunity, Conducted susceptibility, Lightning, and Radar cross section,
  announced as the group "Applications"
- **AND** no application is selected and no item is shown, as again after the
  visitor reloads the page or returns to it
- **AND** its introductory paragraph reads exactly: "Before a single drawing
  exists, you are already being asked what the system will emit, withstand and
  reflect. Getting those answers right is cheaper than discovering them later."

#### Scenario: Visitor reads the application items
- **WHEN** the visitor selects Radiated emissions
- **THEN** its three paragraphs open with every harness and surface radiating
  and one cable or opening being the reason a level crosses its limit, say
  that it can be found before the platform is built, and end with the
  installed emission level against its limit, the cable or opening
  responsible named
- **WHEN** the visitor selects Radiated immunity
- **THEN** its three paragraphs open with threat fields arriving from outside
  — lightning pulses, radar and high-intensity radiated fields — and what
  reaches the equipment inside, follow the field through the skin's shielding
  into every harness to the voltage at each connector that decides whether
  the equipment survives, and name multilayer surface impedances, conformal
  modelling and the Cable Solver
- **WHEN** the visitor selects Conducted susceptibility
- **THEN** its three paragraphs say that a disturbance can enter through a
  power cable or a signal harness and reach one pin, connector or piece of
  equipment, that the disturbance reaching each pin is returned conductor by
  conductor whatever its source, and that levels and injection points can be
  swept and the harness changed and re-run before anything is built
- **WHEN** the visitor selects Lightning
- **THEN** its three paragraphs say that a strike enters at one attachment
  point and leaves at another, that its direct effects and the transients
  induced on cables and equipment are read at each connector, and that
  multilayer surface impedances, conformal modelling and the Cable Solver
  carry the current
- **WHEN** the visitor selects Radar cross section
- **THEN** its three paragraphs say how much of an incident wave comes back
  and from where, over a band of frequencies and angles, that the result is
  the signature across angles rather than one number, and that shaping,
  coatings and openings can be compared before anything is built, so the
  visitor knows which surface does the scattering
- **AND** each item's text is the challenges copy the team supplied, word for
  word, with none of the item's earlier paragraphs left on the page
- **AND** no application item links a paper

#### Scenario: Three applications show Elemwave's own simulation videos
- **WHEN** the visitor selects Radiated emissions, Radiated immunity or
  Conducted susceptibility
- **THEN** its picture area plays that item's own simulation by itself, with no
  further click — the Vivaldi horn antenna, the ev55 aircraft under
  high-intensity radiated fields and the cable run between two panels
  respectively — as a video file the site itself serves, muted, starting again
  from its beginning each time it ends, with no control bar
- **AND** Radiated immunity and Conducted susceptibility move fluidly, at 30
  pictures per second, lasting as long as their simulations, with the
  pictures between the simulation's own generated; Radiated emissions plays
  at its own frame rate
- **AND** the video is shown whole, in its own shape, inside the same picture
  area every other item's picture fills, and no layout moves when the visitor
  switches between a video and a picture
- **AND** the picture area is one control, announced by a name that says what
  activating it does — "Pause" while the video plays or is starting, "Play"
  otherwise — followed by a name that names the item and says it is
  Elemwave's own simulation video
- **AND** the visitor can pause the video by activating it, by pointer, touch or
  keyboard, holding the picture it reached, and resume it the same way

#### Scenario: A video item's tab shows the video's thumbnail
- **WHEN** the home page has loaded
- **THEN** the Radiated emissions, Radiated immunity and Conducted
  susceptibility tab circles show the centre of that item's thumbnail, served
  by the site itself and never by another host

#### Scenario: No video is downloaded before a video item is chosen
- **WHEN** a visitor opens the home page, scrolls through it or chooses any
  other item
- **THEN** the browser requests no video file, and the page makes no request
  to any video service or other host for the challenge videos

#### Scenario: Visitor who prefers reduced motion chooses a video item
- **WHEN** a visitor whose system asks for reduced motion selects any of the
  three video items
- **THEN** its picture area shows the video's thumbnail whole, with its name,
  and no video is shown, started or downloaded, and nothing offers to start
  movement
- **AND WHEN** the preference turns on while the video's picture area holds
  keyboard focus
- **THEN** the video is removed and focus moves to the thumbnail

#### Scenario: The thumbnail stands in until the video plays
- **WHEN** a video item is chosen and its video has not started yet, cannot be
  downloaded or fails while playing
- **THEN** the item's title and text are shown in full at once, and the picture
  area keeps its size and shows the video's thumbnail, named "Play" and the
  item's video name, with no error of the site's own
- **AND WHEN** the video starts playing
- **THEN** the video replaces the thumbnail
- **AND WHEN** the video failed and the visitor activates the picture area
- **THEN** the video is fetched again and asked to play

#### Scenario: A browser that does not start the video by itself
- **WHEN** a video item is chosen in a browser, or a power-saving mode, that
  does not start even a muted video by itself
- **THEN** the picture area shows the thumbnail and is named "Play" and the
  item's video name
- **AND WHEN** the visitor activates it
- **THEN** the video starts

#### Scenario: Visitor activates the picture area several times quickly
- **WHEN** the visitor activates a video item's picture area several times in
  quick succession, even while the video is still starting
- **THEN** the video ends paused or playing as the last activation asked
- **AND** once the browser has reported the result, the picture area's name
  says what activating it would now do

#### Scenario: Visitor moves between video items
- **WHEN** the visitor chooses the tab of the video item already shown
- **THEN** the video carries on from where it is
- **AND WHEN** the visitor moves to another item, or switches quickly between
  several
- **THEN** only the item shown last has a video, and nothing plays or is heard
  out of sight
- **AND WHEN** the visitor returns to a video item, reloads the page or comes
  back to it, and chooses the item again
- **THEN** its video starts again from the beginning

### Requirement: Our Solution presents Elemwave's capabilities, solvers and approach

The software section SHALL present eleven items — The Workbench first, then
the FDTD solver, the DGTD solver and the Cable Solver, then multilayer surface
impedances, conformal modelling, Open and auditable, HPC and SPICE
coupling, then Material characterisation service, and last Simulation
service — in one row group of tabs. Each of the three capabilities, the Cable
Solver, multilayer surface impedances and conformal modelling, links the team's
peer-reviewed papers on it. Its Open and auditable item describes the open
tools it is built on, the tests the whole stack passes and what an open code
lets the visitor do, and closes by telling the visitor that they and their AI
agents get a toolbox they can adjust rather than a black box. The Workbench item describes where an electromagnetic
problem is described inside FreeCAD and plays Elemwave's own recording of it in
use. Its Material characterisation service item presents the measurements Elemwave
performs for the visitor as a service, and its Simulation service item the
simulations Elemwave runs for the visitor as a service. No item names or links
ParaView.

#### Scenario: Visitor opens the home page
- **WHEN** the home page has loaded
- **THEN** the section offers exactly eleven items, each with the same label on
  its tab and as its title, in this order: The Workbench, FDTD solver, DGTD
  solver, Cable Solver, Multilayer surface impedances, Conformal modelling,
  Open and auditable, HPC, SPICE coupling, Material characterisation service,
  and Simulation service, announced as the group
  "Capabilities", wrapping onto further lines where the screen is too narrow
  without any tab overlapping another
- **AND** no tab or title reads "EW Workbench" or "Transparent and open heart"
- **AND** it offers none of The challenges' applications, and no Tessellator
  Mesher item: the page names neither it, opensemba/tessellator nor GiD
- **AND** no capability is selected and no item is shown, as again after the
  visitor reloads the page or returns to it
- **AND** its introductory paragraph reads exactly: "Elemwave gives you that
  answer before the first prototype: coupled 3D fields, cable harnesses and
  circuits, treated as the single system they are. Every method is published,
  peer-reviewed and implemented in open source — so how a number was obtained
  is something you can show, not something you have to trust."
- **AND** that paragraph contains no link

#### Scenario: Visitor reads the capability items
- **WHEN** the visitor selects Multilayer surface impedances
- **THEN** its text says that surfaces a few microns thick in a model metres
  across — carbon-fibre skins, metallised coatings, paint over metal — are
  carried as a surface impedance instead of being meshed, names shielding
  effectiveness of composite panels, lightning current through a coated skin
  and HIRF coupling through a fuselage, and says the method has been through
  peer review and extended since
- **WHEN** the visitor selects Cable Solver
- **THEN** its text opens by saying a harness is not a lumped element, says
  that each bundle is treated as a multiconductor transmission line coupled
  to the 3D field around it in both directions, so that crosstalk,
  field-to-cable coupling and signal integrity are one problem solved at
  once, and names opensemba/tulip as its transmission-line engine and SPICE
  circuits closing the network at every termination
- **WHEN** the visitor selects Conformal modelling
- **THEN** its text says that curved and slanted surfaces, surface impedances
  included, are represented conformally within the regular grid, avoiding
  staircase error, and names where surface accuracy matters

#### Scenario: Visitor reads the solver and approach items
- **WHEN** the visitor selects Open and auditable
- **THEN** its text says that Elemwave is built on open-source tools, FreeCAD,
  Gmsh and opensemba among them, with a battery of tests the whole stack must
  pass before it ships and methods that are published rather than
  proprietary, that nothing is hidden and what the visitor sees is what is
  simulated, and that because the code is the visitor's to read they can test
  it and extend it
- **AND** its last paragraph, a paragraph of its own, says that what the
  visitor gets is not a black box but a toolbox, for them and for the AI agents
  working with them, which they can read and adjust until the simulation fits
  their own problem
- **AND** its third and fourth paragraphs are written for this item rather
  than taken from the solutions copy the team supplied
- **AND** it makes no claim that nobody else offers this approach, no claim
  that the tests or anything else guarantee a result, calls no simulation
  perfect, and names or links no AI model, product or company
- **WHEN** the visitor selects HPC
- **THEN** its text says that the same case runs on one core or across a
  cluster with no cap on nodes or threads, that each build is compiled for the
  machine it runs on, which only an open source allows, that the solvers carry
  their own parallel back ends, and that simulations with billions of cells
  are run routinely
- **WHEN** the visitor selects SPICE coupling
- **THEN** its text says that a termination is rarely a resistor, and that
  circuits described in SPICE are solved by ngspice step by step with the 3D
  field and the Cable Solver's transmission lines, field and circuit acting
  on each other at every time step
- **WHEN** the visitor selects FDTD solver
- **THEN** its text describes a time-domain solver written for EMC problems,
  the cables, circuits and thin layers it treats, that it runs with no limit
  on cells or nodes and is the engine inside The Workbench, and ends by
  naming and linking opensemba/fdtd as open source
- **WHEN** the visitor selects DGTD solver
- **THEN** its text says that it keeps curved geometry true on unstructured
  meshes, names and links opensemba/dgtd, and describes the dispersive media
  and thin multilayer sheets it handles, its parallel and GPU execution and
  its radar cross section post-processing
- **AND** each revised item other than Open and auditable has the text of the
  solutions copy the team supplied, word for word, with none of the item's
  earlier paragraphs left on the page

#### Scenario: Visitor reads the Material characterisation service item
- **WHEN** the visitor selects Material characterisation service
- **THEN** its text opens with the problem the measurements answer — numbers a
  model needs that datasheets do not give — and then says that Elemwave
  measures them for the visitor, as a service, on the visitor's own samples
- **AND** it names the electromagnetic characterisation of carbon-fibre
  materials, the shielding effectiveness of materials and panels, and the
  transfer impedance of cable shields
- **AND** it says that measured values are what a simulation's materials and
  cables are described with, so a model can start from the visitor's own data
  rather than from assumed values
- **AND** it states no accreditation, certification, standard, equipment maker
  or model, frequency range, accuracy, turnaround or price, makes no claim that
  nobody else offers the service, claims no peer review and links nothing,
  paper or software
- **WHEN** the visitor chooses the Material characterisation service tab again while
  its item is shown
- **THEN** the item stays shown as it was and the page does not move

#### Scenario: Visitor reads the Simulation service item
- **WHEN** the visitor selects Simulation service
- **THEN** its text, in two to four paragraphs, opens with the problem the
  service answers — a simulation needs a machine, set-up solvers and the time
  to run it — before it names Elemwave, and then says that Elemwave runs the
  simulations for the visitor, as a service
- **AND** it says that Elemwave builds the model from the visitor's own design,
  runs it on its own computing resources with the same tools the section
  describes, and hands the results back, naming no other item of the section
- **AND** it says the service is for a visitor who wants the answer rather
  than the tool, with no hardware to buy and no software to set up
- **AND** it states no price, turnaround, delivery format, accuracy,
  certification, standard, client's name or guarantee, makes no claim that
  nobody else offers the service, claims no peer review and links nothing,
  paper or software
- **WHEN** the visitor chooses the Simulation service tab again while its item
  is shown
- **THEN** the item stays shown as it was and the page does not move

#### Scenario: Visitor reads The Workbench item
- **WHEN** the visitor selects The Workbench
- **THEN** its text reads exactly "Geometry, materials, sources, ports and
  meshing in one place, inside FreeCAD. The Workbench is where an
  electromagnetic problem gets described — including cable bundles and the
  complex geometry around them — before any solver runs." and "Everything the
  solvers need comes from here, in a format they read directly.", with
  FreeCAD a link to its own site opening in a new tab
- **AND** it links nothing else and no paper

#### Scenario: The Workbench shows Elemwave's own recording of the workbench in use
- **WHEN** the visitor selects The Workbench
- **THEN** its picture area plays, by itself and with no further click, a video
  the site itself serves, muted and with no sound track, starting again from its
  beginning each time it ends, with no control bar, shown whole in its own shape
  inside the same picture area every other item's picture fills
- **AND** the video shows, in order, the demonstration recording's picture at
  every tenth second from 2:00 to its end — 112 pictures, each held for one
  second — with nothing from the recording's first two minutes and no picture
  generated between them
- **AND** the file weighs no more than 6,000,000 bytes and is no more than 720
  pixels high
- **AND** the picture area is one control, named "Pause" while the video plays
  or is starting and "Play" otherwise, followed by "The Workbench video:
  Elemwave's own video of the workbench in use, defining an electromagnetic
  problem", and the visitor can pause and resume it by pointer, touch or
  keyboard
- **AND** its tab circle shows the centre of its thumbnail, a picture of a
  problem being defined in the workbench taken from the kept part of the
  recording, served by the site itself

#### Scenario: The Workbench video behaves as the challenge videos do
- **WHEN** a visitor opens the home page, scrolls through it or chooses any
  other item
- **THEN** the browser requests no video file for The Workbench
- **WHEN** a visitor whose system asks for reduced motion selects The Workbench
- **THEN** its picture area shows the thumbnail whole, with its name, and no
  video is shown, started or downloaded; and when the preference turns on while
  the picture area holds keyboard focus, the video is removed and focus moves to
  the thumbnail
- **WHEN** its video has not started, cannot be downloaded or fails, or the
  browser does not start a muted video by itself
- **THEN** the title and text show at once and the picture area keeps its size,
  showing the thumbnail named "Play", and activating it fetches the video again
  and asks it to play
- **WHEN** the visitor chooses The Workbench tab while its video is shown
- **THEN** the video carries on from where it is
- **WHEN** the visitor moves to another item, reloads the page or leaves it and
  returns, and chooses The Workbench again
- **THEN** its video starts again from the beginning
- **AND** each section holds at most one video, that of the item it shows last,
  and nothing plays or is heard out of sight

#### Scenario: Each capability links the team's peer-reviewed papers
- **WHEN** the visitor selects Multilayer surface impedances, Cable Solver or
  Conformal modelling
- **THEN** its text ends by linking two peer-reviewed papers on it by
  members of Elemwave's team, each named by its title and going to its DOI
  address in a new tab

#### Scenario: Each item shows a picture of its own
- **WHEN** the visitor selects any item, in either section
- **THEN** it shows a picture of its subject that no other item on the page
  shows, whose accessible name names the item
- **AND** the Cable Solver shows the electric-field colour map of a
  five-wire cable cross-section from its solver's documentation, one of
  Elemwave's own pictures, whose accessible name says what it shows
- **AND** Radar cross section shows Elemwave's own far-field picture of an
  aircraft model in a transparent box ringed by far-field detectors,
  published exactly as supplied, whose accessible name says what it shows
- **AND** The Workbench shows the thumbnail of Elemwave's own recording of the
  workbench in use, published with the site, then the video itself, published
  with the site too, whose picture area's accessible name names the item and
  says it is Elemwave's own video of the workbench in use
- **AND** the FDTD solver shows Elemwave's own screenshot of a grid defined
  for an FDTD problem, its FreeCAD workbench with an aircraft model over the
  simulation grid, published exactly as supplied, whose accessible name says
  what it shows
- **AND** Radiated emissions, Radiated immunity and Conducted susceptibility
  each show the thumbnail of Elemwave's own simulation video of that
  application, published with the site, then the animation itself, published
  with the site too, whose picture area's accessible name names the item and
  says it is Elemwave's own simulation video
- **AND** every other item shows a computer-generated picture of its subject,
  rendered for the site
- **AND** no item shows a figure from a paper
- **AND** an own picture is shown whole in the same picture area as every
  other item's picture, uncropped and undistorted, with no control to enlarge
  it, and the item's round tab shows the centre of the same picture
- **AND** while that picture loads, or if it fails to load, the item's title
  and text are shown in full, the picture area keeps its size, and the picture
  keeps its accessible name

### Requirement: Science carousel navigates between slides

The science section MUST let the visitor move between publication slides using
previous/next controls and per-slide dots, wrapping at both ends.

#### Scenario: Visitor advances the carousel
- **WHEN** the visitor activates the next control on the last slide
- **THEN** the first slide becomes active
- **AND WHEN** the visitor activates a specific dot
- **THEN** that dot's slide becomes active

#### Scenario: Assistive technology reads the science carousel
- **WHEN** the science publications are shown, at any point
- **THEN** exactly one publication dot is indicated as current, both visually
  and to assistive technology, and it is the dot whose picture is shown
- **AND WHEN** the visitor moves to a different publication, by a dot or by
  the previous/next controls
- **THEN** assistive technology is informed that the shown picture has
  changed

#### Scenario: Visitor moves between papers with and without a journal
- **WHEN** the visitor moves between papers, whether or not their publication
  records name a journal
- **THEN** the publication picture, the previous and next controls and the
  dots keep their position, and the reserved space under the picture stays
  empty at the same height for every slide

### Requirement: Science publications link to the paper without journal captions

The shown publication's picture SHALL link to that paper's own publication
page. That link SHALL open in a new browsing context, with no reference back
to the page and no referrer, and only the shown paper's link SHALL be present.
No journal-name text or journal link SHALL appear beneath publication images;
publication records, images, affiliation logos and carousel controls remain.

#### Scenario: Visitor opens the shown paper
- **WHEN** the visitor clicks the shown publication picture
- **THEN** the paper's publication page, reached through its DOI, opens in a
  new window
- **AND** the pointer shows the picture is clickable on hover

#### Scenario: Visitor views a paper with or without journal metadata
- **WHEN** any paper is shown, including a paper whose record names a journal
- **THEN** no journal-name caption or journal link appears beneath its image

#### Scenario: Keyboard and assistive technology reach the paper link
- **WHEN** a keyboard user tabs through the section
- **THEN** the paper link receives focus with a
  visible outline
- **AND** assistive technology announces the paper's title followed by
  "(opens in a new window)"

#### Scenario: Only the shown paper's links exist
- **WHEN** another paper is shown
- **THEN** the links belong to the paper now shown, and no other paper's link
  can be clicked, focused or announced
- **AND** following a link leaves the carousel on the same paper

### Requirement: Science carousel dots are visible against the page

An unused science carousel dot SHALL contrast against the section's
background by at least the ratio required of a non-text control (WCAG
1.4.11). The current dot is unaffected.

#### Scenario: Visitor views the science carousel dots
- **WHEN** the science carousel dots are shown
- **THEN** each unused dot meets the non-text contrast minimum against the
  page
- **AND** the current dot keeps its existing appearance

### Requirement: Science partner-mark row occupies its final height before pictures arrive

The science section's partner-mark row SHALL occupy its final displayed
height from the first moment the section is laid out, including while the
partner-mark pictures are still arriving. Content below that row — the
publication picture and the slide previous and next controls — MUST NOT
move when those pictures finish arriving.

#### Scenario: Partner-mark pictures have not yet arrived
- **WHEN** the home page science section is first laid out
- **AND** the partner-mark pictures have not yet arrived
- **THEN** the partner-mark row already occupies the height it will have once
  every mark on the tallest slide has displayed at that viewport
- **AND** the publication picture keeps its position when those pictures
  finish arriving
- **AND** the slide previous and next controls keep their position when those
  pictures finish arriving

#### Scenario: Visitor changes science slide after the pictures have arrived
- **WHEN** the partner-mark pictures have arrived
- **AND** the visitor changes from one science slide to another
- **THEN** the publication picture does not move

#### Scenario: Wide viewport uses the restored height cap
- **WHEN** the science section is laid out on a wide viewport
- **THEN** a square partner mark displays at the restored desktop height cap,
  205 pixels, the cap the section had before EWM-123

#### Scenario: Narrow viewport uses the restored displayed size
- **WHEN** the science section is laid out on a narrow viewport
- **THEN** the partner marks shrink and wrap, a square mark displaying 64
  pixels high, the size it had before EWM-123
- **AND** the reserved height follows that smaller displayed size rather than
  the desktop cap

#### Scenario: Visitor prefers reduced motion
- **WHEN** the visitor prefers reduced motion
- **THEN** the reserved partner-mark space is the same: the reservation is
  about layout, not motion

### Requirement: First-load picture fetching is limited to the first view

On first load, the home page MUST ask the browser to fetch at high priority
only the pictures that are visible in the first view.

#### Scenario: Visitor first opens the home page
- **WHEN** a visitor first opens the home page
- **THEN** the page does not ask the browser to fetch at high priority any
  science-section organisation mark, including the mark on the slide that is
  showing
- **AND** the picture that is visible in the first view — the site mark — may
  still be fetched promptly
- **AND** no airplane picture is fetched for the hero, which shows none
- **AND** the footer mark is not fetched at high priority

#### Scenario: Visitor advances the science carousel
- **WHEN** a visitor advances the science carousel
- **THEN** that slide's organisation marks still appear

#### Scenario: Visitor opens contact or a legal page
- **WHEN** a visitor first opens contact or a legal page
- **THEN** first-load picture fetching on that page is unchanged

### Requirement: Science section is titled by what it shows

The science section's heading SHALL read "Peer-Reviewed Publications".

#### Scenario: Visitor reads the section heading
- **WHEN** the home page has loaded
- **THEN** the science section heading reads "Peer-Reviewed Publications"
- **AND** no heading reads "The Science Behind Us"
- **AND** its introductory paragraph reads exactly: "Decades of peer-reviewed,
  published work on the physics behind every result. Our methods have been
  through review and against measurement, with universities, research centres
  and industrial partners — not assembled for a product launch, or hidden
  behind a trademark."

### Requirement: Science slides show affiliations only

Each science slide's logo row SHALL hold only the logos of institutions the
authors are affiliated with.

#### Scenario: Visitor looks at a publication slide
- **WHEN** any science slide is shown
- **THEN** its logo row shows no European Union, funding agency or funding
  programme logo
- **AND** it shows at least one affiliation logo

### Requirement: Science section shows the supplied high-voltage bonding network paper

#### Scenario: Visitor reaches the newly supplied paper
- **WHEN** the visitor uses the carousel controls or dots
- **THEN** a slide captioned "Design of a High-Voltage Bonding Network for a
  Hybrid Electric Aircraft" is reachable, with a picture of the paper's first
  page and the Airbus, Universidad de Granada and Elemwave logos
- **AND** exactly one slide is current
- **AND** its picture keeps the title, authors, affiliations and abstract
  readable and blurs the body text beside the abstract

### Requirement: Science section shows the supplied nonlinear-effects paper

The science carousel SHALL include a slide for the nonlinear-effects paper
the site owner supplied, showing its first page and its authors'
affiliation logos.

#### Scenario: Visitor reaches the nonlinear-effects paper
- **WHEN** the visitor uses the carousel controls or dots
- **THEN** a slide captioned "A Study of Nonlinear Effects on an Aircraft
  Electrical-Structure Network Mockup" is reachable, with a picture of the
  paper's first page and the Universidad de Granada, Universitat Politècnica
  de Catalunya and Airbus logos, and no other
- **AND** exactly one slide is current

### Requirement: Science section shows the supplied multiwire in-cell parameters paper

The science carousel SHALL include a slide for the multiwire in-cell
parameters paper the site owner supplied, showing its first page and its
authors' affiliation logos.

#### Scenario: Visitor reaches the multiwire in-cell parameters paper
- **WHEN** the visitor uses the carousel controls or dots
- **THEN** a slide captioned "Numerical Computation of Unshielded Multiwires
  In-Cell Parameters for Coupling Between FDTD and MTL Methods Using
  Multipolar Expansions" is reachable, with a picture of the paper's first
  page and the Universidad de Granada and Royal Netherlands Aerospace Centre
  logos, and no other
- **AND** exactly one slide is current

### Requirement: Science-section partner marks use the same published names as the partnerships page

Each partner organisation mark in the science section MUST be labelled with
the same published name that mark uses on the partnerships page. A mark that
is not on the partnerships page, such as Elemwave's own, the Royal Netherlands
Aerospace Centre's or that of any other organisation the partnerships page no
longer presents as a partner, is labelled with its own organisation name.

#### Scenario: Visitor looks at a science-section partner mark
- **WHEN** a partner organisation mark is shown in the science section
- **THEN** it is labelled with the same name that organisation's mark uses on
  the partnerships page, or with its own organisation name where the
  partnerships page does not show it

### Requirement: Organisation marks are published at the size they are shown

Organisation marks SHALL occupy no more pixels than twice the science-section
box they are shown in, so they stay sharp on dense screens without shipping
unused resolution in either dimension.

#### Scenario: Visitor is shown an organisation mark
- **WHEN** an organisation mark is shown in the science section (including the
  Elemwave mark on the high-voltage bonding network slide and the Royal
  Netherlands Aerospace Centre mark on the multiwire in-cell parameters slide)
  or the partner strip
- **THEN** the published picture for that mark fits inside 530 pixels wide and
  410 pixels tall
- **AND** the binding dimension is whichever of those the mark's shape fills
  first
- **AND** a mark already inside that box is not enlarged
- **AND** the science section and the partner strip share the same published
  picture

### Requirement: Science-section publication pictures match their frame without unused weight

Science-section publication pictures SHALL fill their current frame and SHALL
weigh in the same band as the science-section publication picture that already
ships as a compressed photograph of similar dimensions.

#### Scenario: Visitor is shown a science-section publication picture
- **WHEN** a science-section publication picture is shown
- **THEN** it still fills the current frame (at most 980 CSS pixels wide and
  640 CSS pixels tall, cropped from the top)
- **AND** a continuous-tone photograph weighs in the tens of kilobytes, not
  in the several-hundred-kilobyte band of an uncompressed raster of every pixel

#### Scenario: Visitor reads a science-section publication picture
- **WHEN** a science-section publication picture is shown
- **THEN** the paper's title, authors, the affiliations printed in the frame
  and the abstract with its index terms are readable
- **AND** the body text below or beside the abstract, figures and margin notes
  are blurred so they cannot be read

### Requirement: Calls to action open the booking dialog

Booking calls to action ("Schedule a call" and "Schedule a meeting") MUST open
the booking dialog, where the visitor starts the meeting-scheduling flow.
"Download a Demo" instead opens the external demo request form.

#### Scenario: Visitor uses a booking call to action
- **WHEN** the visitor activates "Schedule a call" or "Schedule a meeting"
- **THEN** a modal dialog opens containing the embedded scheduler

### Requirement: Demo requests have their own panel beside meeting bookings

The home page MUST present Book a Meeting and Download a Demo as separate
sibling panels, each with its own level-two heading, description and action.
The meeting panel MUST contain only Schedule a Call; the demo panel MUST
contain only the demo link. Meeting comes first in reading and tab order.
The demo action MUST open the supplied request form in a new tab without
replacing or moving the original page, sending a request, or opening the
booking dialog.

#### Scenario: Visitor views the panels on a wide screen
- **WHEN** the page is viewed at 1440 CSS pixels wide
- **THEN** the panels sit side by side with equal widths, a visible gap and
  level top edges, and the demo panel is outside the meeting panel

#### Scenario: Visitor views the panels on a phone
- **WHEN** the page is viewed at 393 CSS pixels wide
- **THEN** the demo panel sits below the meeting panel with a visible gap
- **AND** both panels and all their contents fit within the screen
- **AND** both actions are at least 24 by 24 CSS pixels

#### Scenario: Keyboard user requests a demo
- **WHEN** the user tabs from Schedule a Call
- **THEN** Download a Demo receives focus and is announced as
  "Download a Demo (opens in a new tab)"
- **AND WHEN** the user activates it
- **THEN** the request form opens separately and the home page stays in place

#### Scenario: The external form cannot be reached
- **WHEN** the form destination fails
- **THEN** the new tab shows the browser or service error
- **AND** the home page remains usable, including Schedule a Call

#### Scenario: Visitor closes the form and opens it again
- **WHEN** the visitor closes its tab and activates Download a Demo again
- **THEN** another form tab opens and the home page stays in place

#### Scenario: Visitor activates the control repeatedly
- **WHEN** Download a Demo is activated more than once
- **THEN** each activation opens the form and sends no submission

### Requirement: Booking dialog embeds the Calendly scheduler

The booking dialog MUST embed the Calendly scheduling widget
so the visitor books the meeting without leaving the site.
The site performs no email verification of its own.

#### Scenario: Visitor opens the booking dialog
- **WHEN** the visitor opens the booking dialog from any booking call to
  action
- **THEN** the Calendly scheduler opens over the page
  showing Jose Diaz's 30-minute meeting page at
  `https://calendly.com/jose-aircury/30min`, requested over `https`
- **AND** every booking call to action opens that same page

#### Scenario: Visitor reopens the booking dialog
- **WHEN** the visitor closes the dialog and opens it again
- **THEN** a single fresh scheduler is shown, never a stacked duplicate

#### Scenario: Visitor closes the booking dialog
- **WHEN** the visitor presses Escape, selects the close control, or selects
  the scrim behind the dialog
- **THEN** the dialog closes
- **AND** the page behind it scrolls again
- **AND** nothing of the dialog's own scheduler is held to have trapped
  keyboard focus inside it, unlike the narrow-viewport navigation dialog

### Requirement: Every page exposes its unique content as a primary-content landmark

Every page SHALL expose its unique content as exactly one primary-content
landmark, distinct from the header, navigation and footer.

#### Scenario: Visitor lands on a page
- **WHEN** a visitor opens the home page, the contact page, the partnerships
  page, the team page, the privacy policy, the integrated policy, or a path that
  has no page
- **THEN** the page presents exactly one primary-content landmark
- **AND** that landmark contains the page's unique content
- **AND** the header, navigation and footer are outside that landmark

### Requirement: Every page offers a way to skip to the primary content

Every page SHALL offer a control at the start of the page that moves a
keyboard user to that landmark without passing through the header controls.
The control SHALL stay visually unobtrusive until it receives keyboard focus.

#### Scenario: Keyboard user arrives at the top of a page
- **WHEN** a keyboard user arrives at the top of the home page, the contact
  page, the partnerships page, the team page, the privacy policy, the integrated
  policy, or a path that has no page
- **THEN** the first control they can activate moves them to the
  primary-content landmark
- **AND** they do not have to move through the header's own controls first

#### Scenario: Visitor who does not use the skip control
- **WHEN** a visitor views any of those pages without moving keyboard focus to
  the skip control
- **THEN** the page's appearance is unchanged by the control's presence

### Requirement: The logo returns the visitor to the top of the site

The brand logo in the header MUST return the visitor to the home page, at its
top.

#### Scenario: Visitor activates the logo on the home page
- **WHEN** the visitor activates the logo on the home page
- **THEN** the page moves to its own top
- **AND** that movement honours the visitor's stated motion preference

#### Scenario: Visitor activates the logo on another page
- **WHEN** the visitor activates the logo on any other page
- **THEN** the home page is presented

### Requirement: Every page offers navigation to every other page

The site MUST present the same primary navigation on every page, listing each
primary page the site serves, and MUST indicate which of them the visitor is
currently on.
Legal pages are reached from the footer and are not primary pages.

#### Scenario: Visitor looks at the navigation
- **WHEN** any page has loaded
- **THEN** the navigation lists every primary page the site serves
- **AND WHEN** that page is itself a primary page
- **THEN** exactly one entry is indicated as the current page, both visually and
  to assistive technology

#### Scenario: Visitor selects another page
- **WHEN** the visitor selects a navigation entry other than the current one
- **THEN** that page is presented, with its own entry now indicated as current

#### Scenario: Visitor views the site on a narrow screen
- **WHEN** the header's contents do not fit the width available
- **THEN** the navigation entries are replaced by a control that reveals them
- **AND** no part of the header is cut off, and the page does not scroll
  sideways

#### Scenario: Visitor reveals the navigation on a narrow screen
- **WHEN** the visitor activates that control
- **THEN** the navigation entries and the scheduling action are presented, as a
  modal dialog
- **AND** focus moves into it and cannot reach a control outside it
- **AND** the page behind it does not scroll
- **AND WHEN** the visitor presses Escape, selects the scrim, chooses an entry,
  or selects a close control
- **THEN** the dialog is hidden again and the control regains focus
- **AND WHEN** the visitor chooses the scheduling action inside the dialog
- **THEN** the dialog closes and the booking dialog opens, and the control
  regains focus once the booking dialog is itself closed

#### Scenario: Assistive technology reads the navigation
- **WHEN** any page is read by assistive technology, at any width
- **THEN** each navigation entry is announced once
- **AND** the control reports whether the entries are currently revealed
- **AND** entries that are not revealed are not reachable

### Requirement: The logo returns the visitor to the top of the current page

On the home page, the logo MUST return the visitor to the top of the page
itself rather than navigating away, because the home page is already where it
would navigate to. On every other page, the logo MUST navigate to the home
page.

#### Scenario: Visitor activates the logo on the home page
- **WHEN** the visitor activates the logo on the home page
- **THEN** the page scrolls to its own top rather than reloading or
  navigating
- **AND** that scroll honours the visitor's reduced-motion preference the
  same way as the rest of the site

#### Scenario: Visitor activates the logo on another page
- **WHEN** the visitor activates the logo on any page other than the home
  page
- **THEN** the home page is presented

### Requirement: Every page states how to reach the company

The site MUST present the company's email address, telephone number, and postal
address in the footer of every page, and those values MUST be identical
wherever they appear.

#### Scenario: Visitor reads the footer
- **WHEN** any page has loaded
- **THEN** the footer states the company's email address, telephone number, and
  postal address

#### Scenario: Visitor compares the footer between pages
- **WHEN** the visitor moves between pages
- **THEN** the footer presents identical content on each

### Requirement: The footer copyright reaches the year of publication

The footer MUST state a copyright period
that begins in 2021 and ends in the year the published site was produced,
so the notice never advertises a stale year.

#### Scenario: Visitor reads the copyright notice
- **WHEN** any page has loaded
- **THEN** the copyright period ends in the year that publication took place

### Requirement: Every page identifies the registered company

The footer of every page MUST state the company's registered name, its tax
identification number and its entry in the mercantile registry.

#### Scenario: Visitor checks who operates the site
- **WHEN** any page has loaded
- **THEN** the footer states the registered company name and its tax
  identification number
- **AND** the footer states the registry, volume, book, folio, section and sheet
  under which the company is registered

### Requirement: Search engines can discover every page

The site MUST tell crawlers that its pages may be indexed and MUST publish a
sitemap listing every page it serves at the production address.

#### Scenario: Crawler reads the crawling rules
- **WHEN** a crawler requests the robots file
- **THEN** every page is allowed to be crawled
- **AND** the location of the sitemap is given

#### Scenario: Crawler reads the sitemap
- **WHEN** a crawler requests the sitemap
- **THEN** it lists every primary page and every legal page at the production
  address, and no other page

### Requirement: Every page describes itself to search engines and link previews

Every page the site serves MUST declare its production address as its canonical
address, and MUST describe itself for link previews with its own title, its own
description, its address, the brand name and a branded preview image.
The not-found page MUST NOT declare a canonical address.

#### Scenario: Search engine reaches a page through an alternative address
- **WHEN** a page is reached through an address other than its production one
- **THEN** the page names its production address as canonical

#### Scenario: Visitor shares a link to a page
- **WHEN** a link to any page is shared somewhere that renders link previews
- **THEN** the preview shows that page's title followed by the brand, its
  description and the branded preview image
- **AND WHEN** the shared page is the home page
- **THEN** the preview shows the brand title without repeating the brand

### Requirement: An unknown address presents a branded not-found page

A request for a path the site does not serve MUST present a not-found page that
keeps the site header and footer and leads the visitor back to the home page.

#### Scenario: Visitor follows a broken link
- **WHEN** a visitor requests a path that has no page
- **THEN** the page states that it was not found, as its primary heading
- **AND** the site header and the site footer are both present
- **AND** a link returns the visitor to the home page
- **AND** the browser tab names the page once, followed by the brand once

### Requirement: An image that fails to load still conveys its meaning

Where a picture fails to load, the page MUST still convey what the picture
was for, through its alt text or accessible label.

#### Scenario: An image fails to load
- **WHEN** an image on the page fails to load
- **THEN** its alt text or accessible label is shown in its place

## Notes

- The header navigation lists only pages that exist. 
- The not-found page has no navigation entry, so no entry is indicated as current.
- Images are served locally from `public/images/`; organisation marks and
  science-section publication pictures are published at a size matching how they
  are shown, and several partner logos are inconsistently trimmed (see
  the style guide's known gaps).
