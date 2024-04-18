#!/bin/bash

# Function to print debug messages if verbosity flag is set
debug() {
    if [ "$VERBOSE" = true ]; then
        echo "DEBUG: $1"
    fi
}

# Function to print status messages
status() {
    echo "STATUS: $1"
}

# Function to print cancellation messages
cancelled() {
    echo "CANCELLED: $1"
}

# Function to rebuild and restart a service
rebuild_and_restart() {
    service_name=$1
    debug "Calling rebuild_and_restart function for service: $service_name"
    debug "Changes detected in $service_name directory. Rebuilding and restarting $service_name service..."
    status "Building and restarting $service_name service..."
    docker-compose build $service_name && docker-compose restart $service_name
}

# Function to debounce filesystem events
debounce() {
    delay=5 # Adjust the debounce delay time as needed (5 seconds in this example)
    cancelled=""
    for ((i=0; i<$delay; i++)); do
        echo -n ". " # Print a dot representing each second of the delay
        sleep 1
        if [ -n "$cancelled" ]; then
            echo -e "\n\e[34mBuild cancelled.\e[0m" # Blue color for cancellation message
            return
        fi
    done
    echo "" # Print a new line after the debounce delay
}

# Parse command-line arguments to check for verbosity flag
while getopts "v" opt; do
    case $opt in
        v)
            VERBOSE=true
            ;;
        \?)
            echo "Invalid option: -$OPTARG" >&2
            ;;
    esac
done

# Shift command line arguments so that $@ only contains positional arguments
shift $((OPTIND - 1))

# Fetch service names from docker-compose.yml
services=$(docker-compose config --services)
debug "Detected services: $services"

# Watch for changes in each service directory and trigger a rebuild
for service in $services; do
    # Check if the directory exists
    if [ ! -d "$service" ]; then
        debug "WARNING: Directory ./$service does not exist. Skipping..."
        continue
    fi

    # Watch for changes in the directory itself (for file additions)
    debug "Watching directory ./$service for changes..."
    fswatch -0 ./$service | while read -d "" -r changed_file; do
        debug "Changes detected in $service directory."
        cancelled=""
        debounce
        rebuild_and_restart $service
    done &

    # Watch for changes in existing files
    debug "Watching files in ./$service directory for changes..."
    find ./$service -type f | entr -r rebuild_and_restart $service &
done

# Wait for background processes to finish
debug "Waiting for background processes to finish..."
wait
