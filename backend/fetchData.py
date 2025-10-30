import csv

def load_colleges(filepath="data/colleges.csv"):
    colleges = []
    with open(filepath, newline='', encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            try:
                name = row["NAME"].strip()
                lat = float(row["LATITUDE"])
                lon = float(row["LONGITUDE"])
                state = row["STATE"].strip()
                city = row["CITY"].strip()
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
