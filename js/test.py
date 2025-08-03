def convert_to_12_hour_format(time_24):
    hour, minute = map(int, time_24.split(":"))
    suffix = "AM"
    
    if hour == 12:
        suffix = "PM"
    elif hour > 12:
        hour -= 12
        suffix = "PM"
        
    return f"{hour:02d}:{minute:02d} {suffix}"

print(convert_to_12_hour_format("00:05"))