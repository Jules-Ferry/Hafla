const x = require("./repository/users")

async function main() {
    const z = await x.findMemberByEmail("lenny.galia@monlycee.net")
    console.log(z)
}

main()