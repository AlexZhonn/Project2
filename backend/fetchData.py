import csv

def load_colleges(filepath="data/colleges.csv"):
    colleges = []
    excluded_states = {"AK", "HI", "PR", "GU", "VI", "MP", "AS", "MH", "FM", "PW"}

    with open(filepath, newline='', encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            try:
                name = row["NAME"].strip()
                lat = float(row["LATITUDE"])
                lon = float(row["LONGITUDE"])
                state = row["STATE"].strip()
                city = row["CITY"].strip()

                if state in excluded_states:
                    continue

                colleges.append({
                    "name": name,
                    "lat": lat,
                    "lon": lon,
                    "city": city,
                    "state": state
                })
            except (ValueError, KeyError):
                continue
    return colleges
