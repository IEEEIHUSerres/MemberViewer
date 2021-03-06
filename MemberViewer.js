'use strict';

const GRAVATAR_URL = "https://www.gravatar.com/avatar/";

const Grades = {
    STUDENT_MEMBER: "Student Member",
    GRADUATE_STUDENT_MEMBER: "Graduate Student Member"
};

const AvatarColors = {
    STUDENT_MEMBER: {
        BG: "000050",
        FONT: "FFFFFF"
    },
    GRADUATE_STUDENT_MEMBER: {
        BG: "000050",
        FONT: "FFFFFF"
    },
    DEFAULT: {
        BG: "000050",
        FONT: "FFFFFF"
    }
};

const MemberStatus = {
    ACTIVE: "Active",
    APPLICANT: "Applicant",
    ARREARS: "Arrears",
    INACTIVE: "Inactive"
};

function getAvatarColor(grade) {
    if (grade === Grades.STUDENT_MEMBER) {
        return AvatarColors.STUDENT_MEMBER;
    }

    if (grade === Grades.GRADUATE_STUDENT_MEMBER) {
        return AvatarColors.GRADUATE_STUDENT_MEMBER;
    }

    return AvatarColors.DEFAULT;
}

function getDefaultAvatar(name, grade) {
    const colors = getAvatarColor(grade);

    return `https://eu.ui-avatars.com/api/?background=${colors.BG}&color=${colors.FONT}&name=${name}&size=128`;
}

function getConfig() {
    return {
        defaultFile: "./Members.csv",
        allowAvatarGlobal: '0'
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
    if (member.status === MemberStatus.ACTIVE) {
        return true;
    }

    return member.status === MemberStatus.APPLICANT;
}

function parseMembers(csvRawFile, allowAvatarGlobal) {
    const rows = csvRawFile.split('\n');

    // Remove the first row, contains the headers
    rows.shift();

    // Reverse list, to remove final line
    const reversedRows = rows.reverse();

    // Remove the first row, contains empty line
    reversedRows.shift();

    // Reverse list, as original
    const finalRows = reversedRows.reverse();

    const unfilteredMembers = finalRows.map(value => parseMember(value, allowAvatarGlobal));

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

function getAvatar(allowAvatarGlobal, allowAvatarUser, eMailHash, fullName, grade) {
    if (!(allowAvatarGlobal)) {
        return getDefaultAvatar(fullName, grade);
    }

    if (!(allowAvatarUser)) {
        return getDefaultAvatar(fullName, grade);
    }

    return getGravatar(eMailHash);
}

function parseMember(member, allowAvatarGlobal) {
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
        region: parseRegion(memberArrayData[8]),
        section: memberArrayData[9],
        school: memberArrayData[10],
        grade: memberArrayData[2],
        status: memberArrayData[3],
        avatar: getAvatar(
            toBoolean(allowAvatarGlobal),
            toBoolean(memberArrayData[11]),
            memberArrayData[0],
            parseName(memberArrayData[1]) + "+" + parseName(memberArrayData[4]),
            memberArrayData[2]
        )
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
        console.table("config is undefined")
        config = getConfig();
    }

    if (typeof config.defaultFile === "undefined") {
        config.defaultFile = getConfig().defaultFile
    }

    const xhr = new XMLHttpRequest();

    xhr.open('GET', config.defaultFile);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const members = parseMembers(xhr.responseText, config.allowAvatarGlobal);

            renderMembers(members);
        } else {
            alert('Request failed.  Returned status of ' + xhr.status);
        }
    };

    xhr.send();
}
