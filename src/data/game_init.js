const game_matrix = [
    {
        lotto_dice: {
            clickable_numbers: [1, 39],
            disabled_numbers: [40, 50],
            bg_img: "/game_assets/lotto-dice.svg",
            controllers: {
                row_one: [
                    {
                        name: "BONUS",
                        disabled: false
                    }, {
                        name: "C1",
                        disabled: false
                    }, {
                        name: "C2",
                        disabled: false
                    }, {
                        name: "C3",
                        disabled: false
                    }, {
                        name: "C2+C3",
                        disabled: false
                    }
                ], row_two: [
                    {
                        name: "C4",
                        disabled: true,
                    }, {
                        name: "JACKPOT",
                        disabled: false
                    }, {
                        name: "CANCEL",
                        disabled: false
                    }
                ]
            }
        }
    },
    {
        lotto_six: {
            clickable_numbers: [1, 49],
            disabled_numbers: [50, 50],
            bg_img: "/game_assets/lotto-six.svg",
            controllers: {
                row_one: [
                    {
                        name: "BONUS",
                        disabled: false
                    }, {
                        name: "C1",
                        disabled: false
                    }, {
                        name: "C2",
                        disabled: false
                    }, {
                        name: "C3",
                        disabled: false
                    }, {
                        name: "C2+C3",
                        disabled: false
                    }
                ], row_two: [
                    {
                        name: "C4",
                        disabled: true,
                    }, {
                        name: "JACKPOT",
                        disabled: false
                    }, {
                        name: "CANCEL",
                        disabled: false
                    }
                ]
            }
        }
    },
    {
        lotto_max: {
            clickable_numbers: [1, 50],
            disabled_numbers: [],
            bg_img: "/game_assets/lotto-max.svg",
            controllers: {
                row_one: [
                    {
                        name: "BONUS",
                        disabled: false
                    }, {
                        name: "C1",
                        disabled: false
                    }, {
                        name: "C2",
                        disabled: false
                    }, {
                        name: "C3",
                        disabled: false
                    }, {
                        name: "C2+C3",
                        disabled: false
                    }
                ], row_two: [
                    {
                        name: "C4",
                        disabled: false,
                    }, {
                        name: "JACKPOT",
                        disabled: false
                    }, {
                        name: "CANCEL",
                        disabled: false
                    }
                ]
            }
        },
    },
    {
        lotto_five: {
            clickable_numbers: [1, 49],
            disabled_numbers: [50, 50],
            bg_img: "/game_assets/lotto-five.svg",
            controllers: {
                row_one: [
                    {
                        name: "BONUS",
                        disabled: false
                    }, {
                        name: "C1",
                        disabled: false
                    }, {
                        name: "C2",
                        disabled: false
                    }, {
                        name: "C3",
                        disabled: false
                    }, {
                        name: "C2+C3",
                        disabled: false
                    }
                ], row_two: [
                    {
                        name: "C4",
                        disabled: false,
                    }, {
                        name: "JACKPOT",
                        disabled: true
                    }, {
                        name: "CANCEL",
                        disabled: false
                    }
                ]
            }
        },
    }
];

export { game_matrix };