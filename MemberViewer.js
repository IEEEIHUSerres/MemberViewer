'use strict';

const GRAVATAR_URL = "https://www.gravatar.com/avatar/";

function getConfig() {
    return {
        defaultAvatar: "https://edu.ieee.org/gr-ihu-serres/wp-content/uploads/sites/92/ieee-ihu-serres-logo.png",
        defaultFile: "./Members.csv",
        allowAvatarGlobal: "0"
    }
}

function toBoolean(valueToCheck) {
    if (typeof valueToCheck === "undefined") {
        return false;
    }

    if (valueToCheck === "") {
        return false;
    }

    return valueToCheck === "1";
}

function isActiveMember(member) {
    if(member.status === "Active") {
        return true;
    }

    return member.status === "Applicant";
}

function parseMembers(csvRawFile, defaultAvatar, allowAvatarGlobal) {
    const rows = csvRawFile.split('\n');

    // Remove the first row, contains the headers
    rows.shift();

    // Reverse list, to remove final line
    const reversedRows = rows.reverse();

    // Remove the first row, contains empty line
    reversedRows.shift();

    // Reverse list, as original
    const finalRows = reversedRows.reverse();

    const unfilteredMembers = finalRows.map(value => parseMember(value, defaultAvatar, allowAvatarGlobal));

    const activeMembers = unfilteredMembers.filter(member => isActiveMember(member));
    const formerMembers = unfilteredMembers.filter(member => !(isActiveMember(member)));

    return activeMembers.concat(formerMembers);
}

function parseName(name) {
    if (name === '') {
        return '';
    }

    const firstChar = name[0].toUpperCase();
    const withFirstChar = name.toLowerCase();

    const withoutFirstChar = withFirstChar.substr(1);

    return firstChar + withoutFirstChar;
}

function parseRegion(region) {
    const number = region.substr(1);

    return "Region" + " " + number;
}

function getGravatar(email) {
    return `${GRAVATAR_URL}${email}`;
}

function parseMail(email) {
    return email;
}

function getAvatar(allowAvatarGlobal, allowAvatarUser, eMailHash, defaultAvatar) {
    if (!(allowAvatarGlobal)) {
        return defaultAvatar;
    }

    if (!(allowAvatarUser)) {
        return defaultAvatar;
    }

    return getGravatar(eMailHash);
}

function parseMember(member, defaultAvatar, allowAvatarGlobal) {
    const memberArrayData = member.split(';');

    return {
        name: {
            namePrefix: parseName(memberArrayData[6]),
            firstName: parseName(memberArrayData[1]),
            middleName: parseName(memberArrayData[5]),
            lastName: parseName(memberArrayData[4]),
            nameSuffix: parseName(memberArrayData[7]),
        },
        eMail: parseMail(memberArrayData[0]),
        region: parseRegion(memberArrayData[9]),
        section: memberArrayData[10],
        school: memberArrayData[8],
        grade: memberArrayData[2],
        status: memberArrayData[3],
        avatar: getAvatar(
            toBoolean(allowAvatarGlobal),
            toBoolean(memberArrayData[11]),
            memberArrayData[0],
            defaultAvatar)
    };
}

function buildFullName(name) {
    const namePrefix = name.namePrefix;
    const firstName = name.firstName;
    const middleName = name.middleName;
    const lastName = name.lastName;
    const nameSuffix = name.nameSuffix;

    return namePrefix + ' ' +
        firstName + ' ' +
        middleName + ' ' +
        lastName + ' ' +
        nameSuffix;
}

function buildMemberHTML(member) {
    const name = buildFullName(member.name);

    const avatar = member.avatar;

    const status = isActiveMember(member) ? "Current Member" : "Former Member";

    const region = member.region;
    const section = member.section;
    const school = member.school;

    return `<div class="member text-center col-12 col-sm-6 col-md-3">
                <div class="member-avatar">
                        <img src="${avatar}" alt="IEEE Member" class="img-responsive rounded-circle"/>
                    </div>
                    <div class="member-info">
                        <div class="member-name">
                            <div class="member-name">
                               ${name}
                            </div>
                        </div>
                        <div>
                            <span class="member-status">
                                ${status}
                            </span>
                        </div>
                        <div class="member-position">
                            <div class="member-region-section">
                                <span>${region}</span>
                                <span> | </span>
                                <span>${section}</span>
                            </div>
                        </div>
                        <div class="member-university">
                            ${school}
                        </div>
                    </div>
            </div>`;
}

function renderMembers(members) {
    const rowStart = "<div class='row'>";
    const rowEnd = "</div>";

    let cols = "";

    members.forEach(member => {
        cols += buildMemberHTML(member);
    });

    document.getElementById("membersPlaceHolder").innerHTML = rowStart + cols + rowEnd;

    return members;
}

function renderMemberViewer(config) {
    if (typeof config === "undefined") {
        config = getConfig();
    }

    if (typeof config.defaultAvatar === "undefined") {
        config.defaultAvatar = getConfig().defaultAvatar
    }

    if (typeof config.defaultFile === "undefined") {
        config.defaultFile = getConfig().defaultFile
    }

    const xhr = new XMLHttpRequest();

    xhr.open('GET', config.defaultFile);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const members = parseMembers(xhr.responseText, config.defaultAvatar, config.allowAvatarGlobal);

            renderMembers(members);
        } else {
            alert('Request failed.  Returned status of ' + xhr.status);
        }
    };

    xhr.send();
}