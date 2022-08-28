
# Description


Created by Ghostwheel#0698

# Usage

Preferred method:

- Add the .js file as a world script to your world. Any actors with an enabled effect called `Stance - Pearl of Black Doubt` will have the effect's applied accordingly. Applying this a s a passive effect will allow player's to manually disable it easily.

Using the `World Scripter` module you can import the included macro into the required compendium instead. 

Alternative (not recommended):

Import the macro and manually run it.

NOTE: becuase this is being attached to a hook, running the macro more than once will execute the command as many times as the macro was run until the application is reloaded. Using the recommended method will registed teh necessary method automatically so there's no room for user error.