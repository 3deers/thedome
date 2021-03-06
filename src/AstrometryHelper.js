let rad = Math.PI / 180,
    deg = 180 / Math.PI,
    dayMs = 1000 * 60 * 60 * 24,
    J1970 = 2440588,
    J2000 = 2451545,
    e = rad * 23.4397; // obliquity of the Earth
export default class AstrometryHelper {

    constructor() {

    }

    static toJulian(date) {
        return date.valueOf() / dayMs - 0.5 + J1970;
    }
    static fromJulian(j) {
        return new Date((j + 0.5 - J1970) * dayMs);
    }
    static toDays(date) {
        return this.toJulian(date) - J2000;
    }
    static siderealTime(d, lw) {
        return rad * (280.16 + 360.9856235 * d) - lw;
    }
    static rightAscension(l, b) {
        return Math.atan((Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e)), Math.cos(l));
    }
    static declination(l, b) {
        return Math.asin((Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l)));
    }
    static azimuth(H, phi, dec) {
        return Math.atan((Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi)));
    }
    static altitude(H, phi, dec) {
        return Math.asin((Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H)));
    }
    static Mod2Pi(_angle) {
        b = _angle / (2.0 * Math.PI);
        a = (2.0 * Math.PI) * (b - Math.floor(b));
        if (a < 0) a = (2.0 * Math.PI) + a;
        return a;
    }
    static convertTo(valor) {
        let signoGrados = 1;
        if (valor < 0) { signoGrados = -1; }
        let grados = Math.abs(parseInt(valor));
        let minutos = (Math.abs(valor) - grados) * 60;
        let segundos = minutos;
        grados = grados * signoGrados;
        minutos = Math.abs(parseInt(minutos));
        segundos = Math.round((segundos - minutos) * 60 * 1000000) / 1000000;

        //console.log(unidad + " : " + grados+ "º  " + minutos + "' " + segundos + "'' ");
        return grados * 3600000 + minutos * 60000 + segundos * 1000;
    }

    static getJulianDate(today) {
        // The Julian Date of the Unix Time epoch is 2440587.5

        if (!today) today = new Date();
        if (typeof today === "string") today = new Date(today);
        return (((typeof today === "number") ? today : today.getTime()) / 86400000.0) + 2440587.5;
    }

    static getGST(clock) {
        if (typeof clock === "undefined") return { status: -1 };
        if (typeof clock === "string") clock = new Date(clock);
        else if (typeof clock === "number") clock = new Date(clock);
        var JD, JD0, S, T, T0, UT, A, GST;
        JD = this.getJulianDate(clock);

        JD0 = Math.floor(JD - 0.5) + 0.5;

        S = JD0 - 2451545.0;


        T = S / 36525.0;
        T0 = (6.697374558 + (2400.051336 * T) + (0.000025862 * T * T)) % 24;
        if (T0 < 0) T0 += 24;
        UT = (((clock.getUTCMilliseconds() / 1000 + clock.getUTCSeconds()) / 60) + clock.getUTCMinutes()) / 60 + clock.getUTCHours();


        A = UT * 1.002737909;
        T0 += A;
        GST = T0 % 24;
        if (GST < 0) GST += 24;


        return GST;
    }

    static getLST(clock, lon) {
        if (typeof clock === "undefined" || typeof lon === "undefined") return { status: -1 };
        var GST = this.getGST(clock);
        var d = (GST + lon / 15.0) / 24.0;
        d = d - Math.floor(d);
        if (d < 0) d += 1;
        return 24.0 * d;
    }

    static getOptimizedLST(clock, lon) {
        if (typeof clock === "undefined" || typeof lon === "undefined") return { status: -1 };
        var GST = this.getGST(clock);
        var d = (GST + lon / 15.0) / 24.0;
        d = d - Math.floor(d);
        if (d < 0) d += 1;
        return 24.0 * d;
    }

    static radec2azel(ra, dec, lat, lon, _date, _LST) {
        let raH = this.convertTo(ra);
        //He calculado el error aqui pero el LST solo una vez fuera del bucle, y le paso siempre el mismo, ha mejorado el rendimiento a tope
        let error = raH - (raH / dayMs) * (1.65 * 3600000);
        error = error / 3600000

        let UTCDays = _date.getTime();

        let LST;
        if (typeof _LST === "undefined")
            LST = this.getLST(UTCDays, lon);
        else
            LST = _LST;

        LST -= error;


        var ha = LST * 15 - ra;

        if (ha < 0) ha += 360;

        ha *= rad;
        dec *= rad;
        lat = ((Math.abs(lat) == 90.0) ? (lat - 0.00001) : lat) * rad;

        var alt = Math.asin(Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(ha));
        var az = Math.acos((Math.sin(dec) - Math.sin(alt) * Math.sin(lat)) / (Math.cos(alt) * Math.cos(lat)));

        var hrz_altitude = alt / rad;
        var hrz_azimuth = az / rad;

        if (Math.sin(ha) > 0) hrz_azimuth = 360 - hrz_azimuth;

        hrz_altitude *= rad;
        hrz_azimuth *= rad;
        return { alt: hrz_altitude, az: hrz_azimuth };
    }
    static CalculateHorizontalCoordinatesMoon(_longitude, _latitude, _date) {


        //Convert the latitude to radians
        _latitude *= rad;
        var lw = rad * _longitude * -1;


        var j2000 = this.toDays(_date);

        var L = rad * (218.316 + 13.176396 * j2000), // ecliptic longitude
            M = rad * (134.963 + 13.064993 * j2000), // mean anomaly
            F = rad * (93.272 + 13.229350 * j2000),  // mean distance

            l = L + rad * 6.289 * Math.sin(M), // longitude
            b = rad * 5.128 * Math.sin(F),     // latitude
            dt = 385001 - 20905 * Math.cos(M);  // distance to the moon in km

        //Calculate the Right ascension and declinaison of the moon
        var e = rad * 23.4397;
        var ra = Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l));
        var dec = Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));

        //Sidereal time
        var HA = (rad * (280.16 + 360.9856235 * j2000) - lw) - ra;

        //Compute Altitude and Azimuth (RAD)
        var altitude = Math.asin(Math.sin(dec) * Math.sin(_latitude) + Math.cos(dec) * Math.cos(_latitude) * Math.cos(HA));
        var azimuth = Math.acos((Math.sin(dec) - Math.sin(altitude) * Math.sin(_latitude)) / (Math.cos(altitude) * Math.cos(_latitude)));

        //Convert both to degree
        altitude *= deg;
        azimuth *= deg;

        if (Math.sin(HA) > 0)
            azimuth = 360 - azimuth;

        altitude *= rad;
        azimuth *= rad;



        return { alt: altitude, az: azimuth, dist: dt / 500000 };
    }

}
